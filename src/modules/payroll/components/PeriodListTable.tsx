import React from 'react';
import { Table, Tag, Button, Typography, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PayrollPeriodSummaryDto, PayrollStatus } from '../types';

const { Text } = Typography;

interface PeriodListTableProps {
    dataSource: PayrollPeriodSummaryDto[];
    loading: boolean;
    onViewDetail: (periodId: number) => void;
}

const getStatusTag = (status: PayrollStatus) => {
    switch (status) {
        case PayrollStatus.Draft:
            return <Tag color="default">Nháp</Tag>;
        case PayrollStatus.Calculated:
            return <Tag color="blue">Đã tính toán</Tag>;
        case PayrollStatus.Approved:
            return <Tag color="green">Đã duyệt</Tag>;
        case PayrollStatus.Paid:
            return <Tag color="gold">Đã thanh toán</Tag>;
        default:
            return <Tag>{status}</Tag>;
    }
};

export const PeriodListTable: React.FC<PeriodListTableProps> = ({ dataSource, loading, onViewDetail }) => {
    const columns = [
        {
            title: 'Kỳ lương',
            key: 'period',
            render: (_: any, record: PayrollPeriodSummaryDto) => (
                <Text strong>Tháng {record.month}/{record.year}</Text>
            ),
        },
        {
            title: 'Thời gian',
            key: 'duration',
            render: (_: any, record: PayrollPeriodSummaryDto) => (
                <Text>
                    {dayjs(record.startDate).format('DD/MM/YYYY')} - {dayjs(record.endDate).format('DD/MM/YYYY')}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: PayrollStatus) => getStatusTag(status),
        },
        {
            title: 'Số nhân viên',
            dataIndex: 'totalEmployees',
            key: 'totalEmployees',
            align: 'center' as const,
        },
        {
            title: 'Tổng quỹ lương',
            dataIndex: 'totalNetSalary',
            key: 'totalNetSalary',
            align: 'right' as const,
            render: (value: number) => (
                <Text strong type="success">
                    {value.toLocaleString()} đ
                </Text>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: PayrollPeriodSummaryDto) => (
                <Space>
                    <Button 
                        type="primary" 
                        size="small" 
                        icon={<EyeOutlined />}
                        onClick={() => onViewDetail(record.periodID)}
                    >
                        Chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="periodID"
            loading={loading}
            pagination={{ pageSize: 12 }}
            scroll={{ x: 800 }}
        />
    );
};
