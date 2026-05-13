import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Typography, App } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { LeaveRequestDto, LeaveRequestStatus, LeaveType } from '../types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface LeaveRequestTableProps {
    dataSource: LeaveRequestDto[];
    loading?: boolean;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onView: (record: LeaveRequestDto) => void;
    showEmployeeInfo?: boolean;
}

export const LeaveRequestTable: React.FC<LeaveRequestTableProps> = ({
    dataSource,
    loading,
    onApprove,
    onReject,
    onView,
    showEmployeeInfo = true
}) => {
    const { modal } = App.useApp();
    const scrollX = showEmployeeInfo ? 910 : 630;

    const getStatusColor = (status: LeaveRequestStatus) => {
        switch (status) {
            case LeaveRequestStatus.Approved: return 'success';
            case LeaveRequestStatus.Rejected: return 'error';
            case LeaveRequestStatus.Pending: return 'processing';
            case LeaveRequestStatus.Cancelled: return 'default';
            default: return 'default';
        }
    };

    const getLeaveTypeLabel = (type: LeaveType) => {
        switch (type) {
            case LeaveType.Annual: return 'Nghỉ phép năm';
            case LeaveType.Sick: return 'Nghỉ ốm';
            case LeaveType.Unpaid: return 'Nghỉ không lương';
            case LeaveType.Maternity: return 'Nghỉ thai sản';
            case LeaveType.Other: return 'Khác';
            default: return type;
        }
    };

    const columns = [
        ...(showEmployeeInfo ? [
            {
                title: 'Mã NV',
                dataIndex: 'employeeCode',
                key: 'employeeCode',
                width: 100,
                render: (code: string) => <Text strong>{code}</Text>
            },
            {
                title: 'Họ tên',
                dataIndex: 'employeeName',
                key: 'employeeName',
                width: 180,
            }
        ] : []),
        {
            title: 'Loại nghỉ',
            dataIndex: 'leaveType',
            key: 'leaveType',
            width: 140,
            render: (type: LeaveType) => <Tag color="blue">{getLeaveTypeLabel(type)}</Tag>
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 170,
            render: (_: any, record: LeaveRequestDto) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 13 }}>{dayjs(record.fromDate).format('DD/MM/YYYY')} - {dayjs(record.toDate).format('DD/MM/YYYY')}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Tổng: {record.totalDays} ngày</Text>
                </Space>
            )
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
            width: 150,
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            render: (status: LeaveRequestStatus) => {
                let label = 'UNKNOWN';
                switch (status) {
                    case LeaveRequestStatus.Pending: label = 'PENDING'; break;
                    case LeaveRequestStatus.Approved: label = 'APPROVED'; break;
                    case LeaveRequestStatus.Rejected: label = 'REJECTED'; break;
                    case LeaveRequestStatus.Cancelled: label = 'CANCELLED'; break;
                }
                return <Tag color={getStatusColor(status)}>{label}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right' as const,
            width: 80,
            render: (_: any, record: LeaveRequestDto) => (
                <Space size={-8}>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => onView(record)}
                        />
                    </Tooltip>
                    {record.status === LeaveRequestStatus.Pending && (
                        <>
                            <Tooltip title="Phê duyệt">
                                <Button
                                    type="text"
                                    size="small"
                                    style={{ color: '#52c41a' }}
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => onApprove(record.requestId)}
                                />
                            </Tooltip>
                            <Tooltip title="Từ chối">
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => onReject(record.requestId)}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            rowKey="requestId"
            pagination={{ pageSize: 10 }}
            scroll={{ x: scrollX }}
            style={{ borderRadius: 12, overflow: 'hidden' }}
        />
    );
};
