import numpy as np
import pandas as pd
from scipy.signal import hilbert
from datetime import datetime, timedelta
import json

class HilbertPhaseAnalyzer:
    """
    希尔伯特相位分析器
    
    原理：通过希尔伯特变换将实数时间序列转换为解析信号，
    提取振幅和相位两个维度，用于周期识别和时间预测。
    """
    
    def __init__(self):
        self.data = None
        self.analytic_signal = None
        self.amplitude = None
        self.phase = None
        self.unwrapped_phase = None
        
    def load_data(self, dates, values):
        """
        加载时间序列数据
        
        Args:
            dates: 日期列表
            values: 每日新闻数量/事件强度
        """
        self.data = pd.DataFrame({
            'date': pd.to_datetime(dates),
            'value': values
        }).sort_values('date').reset_index(drop=True)
        
    def detrend(self, method='linear'):
        """去趋势处理"""
        if method == 'linear':
            x = np.arange(len(self.data))
            z = np.polyfit(x, self.data['value'], 1)
            trend = np.poly1d(z)(x)
            self.data['detrended'] = self.data['value'] - trend
        else:
            # 移动平均去趋势
            self.data['detrended'] = self.data['value'] - self.data['value'].rolling(window=7, center=True).mean()
            self.data['detrended'] = self.data['detrended'].fillna(0)
            
    def apply_hilbert(self):
        """
        应用希尔伯特变换
        
        构造解析信号：z(t) = x(t) + i*H(x(t))
        其中 H(x(t)) 是希尔伯特变换（90°相位平移）
        """
        signal = self.data['detrended'].values
        
        # 希尔伯特变换
        self.analytic_signal = hilbert(signal)
        
        # 提取振幅：A(t) = |z(t)| = sqrt(x² + H(x)²)
        self.amplitude = np.abs(self.analytic_signal)
        
        # 提取相位：φ(t) = arg(z(t)) = atan2(H(x), x)
        self.phase = np.angle(self.analytic_signal, deg=True)
        
        # 展开相位（消除 -180° 到 180° 的跳变）
        self.unwrapped_phase = np.unwrap(np.angle(self.analytic_signal))
        
        # 保存结果
        self.data['amplitude'] = self.amplitude
        self.data['phase'] = self.phase
        self.data['unwrapped_phase'] = self.unwrapped_phase
        
    def calculate_phase_velocity(self, window=7):
        """
        计算相位推进速度（度/天）
        
        v = dφ/dt
        """
        self.data['phase_velocity'] = np.gradient(
            self.data['unwrapped_phase'], 
            window
        ) * (180 / np.pi)  # 转换为度/天
        
    def predict_next_peak(self, current_date=None):
        """
        预测下一个周期峰值时间
        
        基于当前相位和推进速度，预测达到下一个 360° 的时间
        """
        if current_date is None:
            current_date = self.data['date'].iloc[-1]
            current_idx = -1
        else:
            current_idx = self.data[self.data['date'] <= current_date].index[-1]
            
        current_phase = self.data['unwrapped_phase'].iloc[current_idx]
        current_velocity = self.data['phase_velocity'].iloc[current_idx]
        
        if current_velocity <= 0:
            return None
            
        # 目标相位：下一个 2π 的倍数（360°）
        target_phase = np.ceil(current_phase / (2 * np.pi)) * 2 * np.pi
        delta_phase = target_phase - current_phase
        
        # 转换为度
        delta_phase_deg = delta_phase * (180 / np.pi)
        
        # 计算剩余时间
        delta_days = delta_phase_deg / abs(current_velocity)
        
        predicted_date = current_date + timedelta(days=int(delta_days))
        
        return {
            'current_phase_deg': current_phase * (180 / np.pi) % 360,
            'target_phase_deg': target_phase * (180 / np.pi) % 360,
            'phase_velocity_deg_per_day': current_velocity,
            'days_to_peak': int(delta_days),
            'predicted_peak_date': predicted_date.strftime('%Y-%m-%d'),
            'confidence': self._calculate_confidence(current_idx)
        }
        
    def _calculate_confidence(self, idx):
        """计算预测置信度（基于振幅稳定性）"""
        if idx < 7:
            return 0.5
            
        recent_amplitude = self.data['amplitude'].iloc[max(0, idx-7):idx+1]
        cv = recent_amplitude.std() / recent_amplitude.mean() if recent_amplitude.mean() > 0 else 1
        
        # 变异系数越小，置信度越高
        confidence = max(0.3, min(0.95, 1 - cv))
        return round(confidence, 2)
        
    def get_cycle_status(self, idx=-1):
        """
        获取当前周期状态
        
        返回：
        - 周期完成度（0-100%）
        - 周期强度（振幅）
        - 周期位置描述
        """
        phase_deg = self.data['phase'].iloc[idx]
        amplitude = self.data['amplitude'].iloc[idx]
        
        # 周期完成度
        completion = (phase_deg + 180) / 3.6  # 转换为 0-100
        
        # 周期位置描述
        if -45 <= phase_deg <= 45:
            position = "上升期"
        elif 45 < phase_deg <= 135:
            position = "峰值期"
        elif -135 <= phase_deg < -45:
            position = "谷值期"
        else:
            position = "下降期"
            
        return {
            'completion_percent': round(completion, 1),
            'amplitude': round(amplitude, 2),
            'phase_deg': round(phase_deg, 1),
            'position': position
        }
        
    def analyze(self, dates, values):
        """
        完整分析流程
        
        输入：日期列表和对应的新闻数量/事件强度
        输出：周期分析结果和预测
        """
        self.load_data(dates, values)
        self.detrend()
        self.apply_hilbert()
        self.calculate_phase_velocity()
        
        # 获取最新状态
        status = self.get_cycle_status()
        prediction = self.predict_next_peak()
        
        return {
            'status': status,
            'prediction': prediction,
            'data': self.data.to_dict('records')
        }

# ==================== 应用到伊朗情报 ====================

def analyze_iran_news_cycle(news_data):
    """
    分析伊朗新闻周期
    
    Args:
        news_data: DataFrame with 'date' and 'count' columns
    
    Returns:
        周期分析结果
    """
    analyzer = HilbertPhaseAnalyzer()
    
    result = analyzer.analyze(
        dates=news_data['date'],
        values=news_data['count']
    )
    
    return result

# 示例用法
if __name__ == "__main__":
    # 模拟过去30天的伊朗新闻数据
    dates = pd.date_range(end=datetime.now(), periods=30, freq='D')
    
    # 模拟新闻数量（带周期波动）
    np.random.seed(42)
    base = 50
    trend = np.linspace(0, 20, 30)
    cycle = 30 * np.sin(2 * np.pi * np.arange(30) / 7)  # 7天周期
    noise = np.random.normal(0, 5, 30)
    values = base + trend + cycle + noise
    
    # 分析
    analyzer = HilbertPhaseAnalyzer()
    result = analyzer.analyze(dates, values)
    
    print("=== 希尔伯特相位分析结果 ===")
    print(f"\n周期状态:")
    print(f"  - 完成度: {result['status']['completion_percent']}%")
    print(f"  - 振幅: {result['status']['amplitude']}")
    print(f"  - 相位: {result['status']['phase_deg']}°")
    print(f"  - 位置: {result['status']['position']}")
    
    print(f"\n峰值预测:")
    if result['prediction']:
        print(f"  - 当前相位: {result['prediction']['current_phase_deg']:.1f}°")
        print(f"  - 相位速度: {result['prediction']['phase_velocity_deg_per_day']:.2f}°/天")
        print(f"  - 距离峰值: {result['prediction']['days_to_peak']} 天")
        print(f"  - 预测峰值日期: {result['prediction']['predicted_peak_date']}")
        print(f"  - 置信度: {result['prediction']['confidence']}")
    else:
        print("  - 无法预测（相位速度非正）")
