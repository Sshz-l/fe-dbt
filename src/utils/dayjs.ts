import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 确保配置在服务器端和客户端一致
if (typeof window !== 'undefined') {
    dayjs.extend(utc);
}

dayjs.extend(timezone);

// 设置默认时区
dayjs.tz.setDefault('UTC');

export default dayjs; 