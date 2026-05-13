import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { 
    CheckCircleOutlined, 
    UserDeleteOutlined, 
    ClockCircleOutlined, 
    RocketOutlined, 
    CalendarOutlined,
    TeamOutlined,
    LineChartOutlined
} from '@ant-design/icons';

interface AdminAttendanceStats {
    presentToday: number;
    totalEmployees: number;
    absent: number;
    lateArrivals: number;
    overtimeHours: number;
    pendingLeaves: number;
}

interface EmployeeAttendanceStats {
    workingDays: number;
    totalHours: number;
    lateCount: number;
}

interface AttendanceStatsProps {
    isAdmin: boolean;
    adminStats?: AdminAttendanceStats;
    employeeStats?: EmployeeAttendanceStats;
    loading?: boolean;
}

const defaultAdminStats: AdminAttendanceStats = {
    presentToday: 0,
    totalEmployees: 0,
    absent: 0,
    lateArrivals: 0,
    overtimeHours: 0,
    pendingLeaves: 0,
};

const defaultEmployeeStats: EmployeeAttendanceStats = {
    workingDays: 0,
    totalHours: 0,
    lateCount: 0,
};

export const AttendanceStats = ({ isAdmin, adminStats, employeeStats, loading = false }: AttendanceStatsProps) => {
    const admin = adminStats ?? defaultAdminStats;
    const employee = employeeStats ?? defaultEmployeeStats;

    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {isAdmin ? (
                <>
                    <Col xs={12} sm={8} lg={4}>
                        <Card size="small" hoverable loading={loading}>
                            <Statistic 
                                title={<span style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: 500 }}>Present Today</span>} 
                                value={admin.presentToday} 
                                prefix={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />}
                                suffix={<span style={{ fontSize: '12px' }}>{`/ ${admin.totalEmployees}`}</span>}
                                styles={{ content: { color: '#52c41a', fontSize: '18px', fontWeight: 'bold' } }} 
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={8} lg={4}>
                        <Card size="small" hoverable loading={loading}>
                            <Statistic 
                                title={<span style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: 500 }}>Absent</span>} 
                                value={admin.absent} 
                                prefix={<UserDeleteOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />}
                                styles={{ content: { color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' } }} 
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={8} lg={4}>
                        <Card size="small" hoverable loading={loading}>
                            <Statistic 
                                title={<span style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: 500 }}>Late Arrivals</span>} 
                                value={admin.lateArrivals} 
                                prefix={<ClockCircleOutlined style={{ color: '#faad14', fontSize: '16px' }} />}
                                styles={{ content: { color: '#faad14', fontSize: '18px', fontWeight: 'bold' } }} 
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={8} lg={4}>
                        <Card size="small" hoverable loading={loading}>
                            <Statistic 
                                title={<span style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: 500 }}>Overtime Hours</span>} 
                                value={admin.overtimeHours} 
                                prefix={<RocketOutlined style={{ color: '#1890ff', fontSize: '16px' }} />}
                                suffix={<span style={{ fontSize: '12px' }}>h</span>}
                                styles={{ content: { color: '#1890ff', fontSize: '18px', fontWeight: 'bold' } }} 
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={8} lg={4}>
                        <Card size="small" hoverable loading={loading}>
                            <Statistic 
                                title={<span style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: 500 }}>Pending Leaves</span>} 
                                value={admin.pendingLeaves} 
                                prefix={<CalendarOutlined style={{ color: '#722ed1', fontSize: '16px' }} />}
                                styles={{ content: { color: '#722ed1', fontSize: '18px', fontWeight: 'bold' } }} 
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={8} lg={4}>
                        <Card size="small" hoverable loading={loading}>
                            <Statistic 
                                title={<span style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: 500 }}>Total Employees</span>} 
                                value={admin.totalEmployees} 
                                prefix={<TeamOutlined style={{ fontSize: '16px' }} />}
                                styles={{ content: { fontSize: '18px', fontWeight: 'bold' } }} 
                            />
                        </Card>
                    </Col>
                </>
            ) : (
                <>
                    <Col xs={24} sm={8} lg={8}>
                        <Card size="small" hoverable loading={loading}>
                            <Statistic 
                                title={<span style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: 500 }}>Working Days</span>} 
                                value={employee.workingDays} 
                                prefix={<LineChartOutlined style={{ color: '#1890ff', fontSize: '16px' }} />}
                                suffix={<span style={{ fontSize: '12px' }}>days</span>} 
                                styles={{ content: { fontSize: '18px', fontWeight: 'bold' } }} 
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8} lg={8}>
                        <Card size="small" hoverable loading={loading}>
                            <Statistic 
                                title={<span style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: 500 }}>Total Hours</span>} 
                                value={employee.totalHours} 
                                precision={2} 
                                prefix={<ClockCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />}
                                suffix={<span style={{ fontSize: '12px' }}>hrs</span>} 
                                styles={{ content: { fontSize: '18px', fontWeight: 'bold' } }} 
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8} lg={8}>
                        <Card size="small" hoverable loading={loading}>
                            <Statistic 
                                title={<span style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: 500 }}>Late Count</span>} 
                                value={employee.lateCount} 
                                prefix={<ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />}
                                styles={{ content: { color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' } }} 
                            />
                        </Card>
                    </Col>
                </>
            )}
        </Row>
    );
};
