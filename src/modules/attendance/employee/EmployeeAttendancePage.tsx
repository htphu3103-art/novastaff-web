import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Calendar, Card, Col, Row, Select, Space, Tag, Typography } from 'antd';
import { ClockCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import { AttendanceStats } from '../components/AttendanceStats';
import { AttendanceTable } from '../components/AttendanceTable';
import { CheckInCard } from '../components/CheckInCard';
import { AttendanceDto, AttendanceStatus, LeaveRequestDto, LeaveRequestStatus, LeaveType } from '../types';
import { attendanceApi } from '../api/attendanceApi';
import { useAuth } from '../../../contexts/AuthContext';
import { LeaveRequestModal } from '../components/LeaveRequestModal';
import { LeaveRequestTable } from '../components/LeaveRequestTable';
import { leaveRequestApi } from '../api/leaveRequestApi';
import { Tabs, Button } from 'antd';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        if (typeof error.response?.data === 'string' && error.response.data.trim()) {
            return error.response.data;
        }

        const payload = error.response?.data as { message?: string; title?: string; detail?: string } | undefined;
        if (payload?.message) return payload.message;
        if (payload?.title) return payload.title;
        if (payload?.detail) return payload.detail;
    }

    return fallback;
};

const getStatusDotColor = (status: AttendanceStatus): string => {
    switch (status) {
        case AttendanceStatus.Present:
            return '#52c41a';
        case AttendanceStatus.Late:
            return '#faad14';
        case AttendanceStatus.Absent:
            return '#ff4d4f';
        case AttendanceStatus.HalfDay:
            return '#1677ff';
        case AttendanceStatus.Leave:
            return '#722ed1';
        default:
            return '#d9d9d9';
    }
};

export default function EmployeeAttendancePage() {
    const { message, modal } = App.useApp();
    const { user } = useAuth();

    const employeeId = user?.userId;

    const [calendarValue, setCalendarValue] = useState(dayjs());
    const [monthlyRecords, setMonthlyRecords] = useState<AttendanceDto[]>([]);
    const [todayRecord, setTodayRecord] = useState<AttendanceDto | null>(null);
    const [totalHoursFromApi, setTotalHoursFromApi] = useState<number | null>(null);

    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isTodayLoading, setIsTodayLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionType, setActionType] = useState<'check-in' | 'check-out' | null>(null);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    const [personalLeaves, setPersonalLeaves] = useState<LeaveRequestDto[]>([]);
    const [isLeavesLoading, setIsLeavesLoading] = useState(false);

    const loadTodayRecord = useCallback(async (showError = true) => {
        setIsTodayLoading(true);
        try {
            const res = await attendanceApi.getTodaySelf();
            setTodayRecord(res.data);
            if (res.data) {
                setMonthlyRecords([res.data]);
            } else {
                setMonthlyRecords([]);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 204)) {
                setTodayRecord(null);
                setMonthlyRecords([]);
            } else if (showError) {
                message.error(extractErrorMessage(error, 'Cannot load today attendance.'));
            }
        } finally {
            setIsTodayLoading(false);
        }
    }, [message]);

    const loadMonthlyRecords = useCallback(async (value: Dayjs) => {
        if (!employeeId) return;

        setIsHistoryLoading(true);
        const year = value.year();
        const month = value.month() + 1;

        try {
            const totalHoursRes = await attendanceApi.getTotalHoursSelf(year, month);
            if (totalHoursRes.data && typeof totalHoursRes.data.totalHours === 'number') {
                setTotalHoursFromApi(totalHoursRes.data.totalHours);
            } else {
                setTotalHoursFromApi(null);
            }
        } catch (err) {
            console.error("Lỗi khi lấy tổng số giờ:", err);
            setTotalHoursFromApi(null);
        } finally {
            setIsHistoryLoading(false);
        }
    }, [employeeId]);


    const loadPersonalLeaves = useCallback(async () => {
        if (!employeeId) return;
        setIsLeavesLoading(true);
        try {
            const res = await leaveRequestApi.getMyRequests();
            setPersonalLeaves(res.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách đơn nghỉ:", error);
            // message.error('Không thể tải danh sách đơn nghỉ.');
        } finally {
            setIsLeavesLoading(false);
        }
    }, [employeeId]);

    const refreshData = useCallback(async () => {
        await Promise.all([
            loadTodayRecord(false),
            loadMonthlyRecords(calendarValue),
            loadPersonalLeaves(),
        ]);
    }, [loadTodayRecord, loadMonthlyRecords, loadPersonalLeaves, calendarValue]);

    const handleCheckIn = useCallback(async () => {
        setIsActionLoading(true);
        setActionType('check-in');

        try {
            await attendanceApi.checkInSelf();
            message.success('Check-in successful.');
            await refreshData();
        } catch (error) {
            message.error(extractErrorMessage(error, 'Check-in failed.'));
        } finally {
            setIsActionLoading(false);
            setActionType(null);
        }
    }, [message, refreshData]);

    const handleCheckOut = useCallback(async () => {
        setIsActionLoading(true);
        setActionType('check-out');

        try {
            await attendanceApi.checkOutSelf();
            message.success('Check-out successful.');
            await refreshData();
        } catch (error) {
            message.error(extractErrorMessage(error, 'Check-out failed.'));
        } finally {
            setIsActionLoading(false);
            setActionType(null);
        }
    }, [message, refreshData]);

    useEffect(() => {
        if (!employeeId) return;
        loadTodayRecord();
    }, [employeeId, loadTodayRecord]);

    useEffect(() => {
        if (!employeeId) return;
        loadMonthlyRecords(calendarValue);
        loadPersonalLeaves();
    }, [employeeId, calendarValue, loadMonthlyRecords, loadPersonalLeaves]);

    const sortedMonthlyRecords = useMemo(
        () => [...monthlyRecords].sort((a, b) => dayjs(b.workDate).valueOf() - dayjs(a.workDate).valueOf()),
        [monthlyRecords],
    );

    const recordsByDate = useMemo(() => {
        const map = new Map<string, AttendanceDto>();
        for (const record of monthlyRecords) {
            map.set(dayjs(record.workDate).format('YYYY-MM-DD'), record);
        }
        return map;
    }, [monthlyRecords]);

    const employeeStats = useMemo(() => {
        const workingStatuses = new Set([
            AttendanceStatus.Present,
            AttendanceStatus.Late,
            AttendanceStatus.HalfDay,
        ]);

        const workingDays = monthlyRecords.filter((record) => workingStatuses.has(record.status)).length;
        const lateCount = monthlyRecords.filter((record) => record.status === AttendanceStatus.Late).length;
        const totalHoursFromRecords = monthlyRecords.reduce((sum, record) => sum + (record.workHours ?? 0), 0);

        return {
            workingDays,
            lateCount,
            totalHours: typeof totalHoursFromApi === 'number' ? totalHoursFromApi : totalHoursFromRecords,
        };
    }, [monthlyRecords, totalHoursFromApi]);

    return (
        <div className="employee-attendance-page">
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: '1 1 300px' }}>
                    <Title level={3} style={{ margin: 0 }}>Personal Attendance Board</Title>
                    <Text type="secondary">Track your working hours and attendance history</Text>
                </div>
                <Space style={{ flexShrink: 0 }}>
                    <Tag color="blue" icon={<ClockCircleOutlined />} style={{ padding: '5px 10px', fontSize: '14px', whiteSpace: 'normal', height: 'auto' }}>
                        Shift: Standard (08:00 - 17:00)
                    </Tag>
                </Space>
            </div>

            <AttendanceStats isAdmin={false} employeeStats={employeeStats} loading={isHistoryLoading} />

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <CheckInCard
                        todayRecord={todayRecord}
                        loading={isTodayLoading}
                        actionLoading={isActionLoading}
                        actionType={actionType}
                        onCheckIn={handleCheckIn}
                        onCheckOut={handleCheckOut}
                    />

                    <Tabs
                        type="card"
                        tabBarExtraContent={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsLeaveModalOpen(true)}
                                size="small"
                                style={{ marginRight: 16 }}
                            >
                                Tạo đơn mới
                            </Button>
                        }
                        items={[
                            {
                                key: 'attendance',
                                label: <Space><HistoryOutlined />Lịch sử Chấm công</Space>,
                                children: (
                                    <Card>
                                        <AttendanceTable isAdmin={false} dataSource={sortedMonthlyRecords} loading={isHistoryLoading} />
                                    </Card>
                                )
                            },
                            {
                                key: 'leaves',
                                label: <Space><FileTextOutlined />Đơn nghỉ phép</Space>,
                                children: (
                                    <Card>
                                        <LeaveRequestTable
                                            dataSource={personalLeaves}
                                            loading={isLeavesLoading}
                                            onApprove={() => { }} // Employee cannot approve
                                            onReject={() => { }} // Employee cannot reject
                                            showEmployeeInfo={false}
                                            onView={(record) => {
                                                modal.info({
                                                    title: 'Chi tiết đơn nghỉ phép',
                                                    content: (
                                                        <div style={{ marginTop: 16 }}>
                                                            <p><b>Loại nghỉ:</b> {record.leaveType}</p>
                                                            <p><b>Thời gian:</b> {dayjs(record.fromDate).format('DD/MM/YYYY')} - {dayjs(record.toDate).format('DD/MM/YYYY')}</p>
                                                            <p><b>Tổng số ngày:</b> {record.totalDays}</p>
                                                            <p><b>Lý do:</b> {record.reason}</p>
                                                            <p><b>Trạng thái:</b> {record.status}</p>
                                                            {record.approvedBy && <p><b>Người duyệt (ID):</b> {record.approvedBy}</p>}
                                                            {record.approvedDate && <p><b>Ngày duyệt:</b> {dayjs(record.approvedDate).format('DD/MM/YYYY HH:mm')}</p>}
                                                        </div>
                                                    ),
                                                    width: 500
                                                });
                                            }}
                                        />
                                    </Card>
                                )
                            }
                        ]}
                    />
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Work Schedule" size="small" styles={{ body: { padding: '12px' } }}>
                        <Calendar
                            fullscreen={false}
                            value={calendarValue}
                            onPanelChange={(nextValue) => setCalendarValue(nextValue)}
                            fullCellRender={(current, info) => {
                                if (info.type !== 'date') return info.originNode;

                                const dayRecord = recordsByDate.get(current.format('YYYY-MM-DD'));
                                if (!dayRecord) return info.originNode;

                                const bgColor = getStatusDotColor(dayRecord.status);

                                return (
                                    <div style={{ padding: '2px 4px', height: '100%' }}>
                                        <div
                                            style={{
                                                background: bgColor,
                                                color: '#fff',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '100%',
                                                height: '100%',
                                                minHeight: '24px',
                                                fontWeight: 500,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            {current.date()}
                                        </div>
                                    </div>
                                );
                            }}
                            headerRender={({ value, onChange }) => {
                                const year = value.year();
                                const month = value.month();

                                const yearOptions = [];
                                for (let i = year - 10; i < year + 10; i += 1) {
                                    yearOptions.push(<Select.Option key={i} value={i}>{i}</Select.Option>);
                                }

                                const monthOptions = [];
                                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                for (let i = 0; i < 12; i += 1) {
                                    monthOptions.push(<Select.Option key={i} value={i}>{months[i]}</Select.Option>);
                                }

                                return (
                                    <div style={{ padding: 8, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        <Select
                                            size="small"
                                            value={year}
                                            onChange={(newYear) => {
                                                const nextValue = value.clone().year(newYear);
                                                onChange(nextValue);
                                                setCalendarValue(nextValue);
                                            }}
                                            style={{ flex: 1, minWidth: '80px' }}
                                        >
                                            {yearOptions}
                                        </Select>
                                        <Select
                                            size="small"
                                            value={month}
                                            onChange={(newMonth) => {
                                                const nextValue = value.clone().month(newMonth);
                                                onChange(nextValue);
                                                setCalendarValue(nextValue);
                                            }}
                                            style={{ flex: 1, minWidth: '90px' }}
                                        >
                                            {monthOptions}
                                        </Select>
                                    </div>
                                );
                            }}
                        />
                        <div style={{ marginTop: 16 }}>
                            <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                                <Text strong>Legend:</Text>
                                <Space orientation="horizontal"><Tag color="green">-</Tag><Text style={{ fontSize: '12px' }}>On Time</Text></Space>
                                <Space orientation="horizontal"><Tag color="warning">-</Tag><Text style={{ fontSize: '12px' }}>Late / Early Leave</Text></Space>
                                <Space orientation="horizontal"><Tag color="error">-</Tag><Text style={{ fontSize: '12px' }}>Absent</Text></Space>
                                <Space orientation="horizontal"><Tag color="blue">-</Tag><Text style={{ fontSize: '12px' }}>Half Day</Text></Space>
                                <Space orientation="horizontal"><Tag color="purple">-</Tag><Text style={{ fontSize: '12px' }}>On Leave</Text></Space>
                            </Space>
                        </div>
                    </Card>
                </Col>
            </Row>

            <LeaveRequestModal
                open={isLeaveModalOpen}
                onCancel={() => setIsLeaveModalOpen(false)}
                onSuccess={refreshData}
            />
        </div>
    );
}
