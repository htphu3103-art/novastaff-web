import React, { useState } from 'react';
import { Table, Tag, Space, Button, App, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { AttendanceDto, AttendanceStatus } from '../types';
import dayjs from 'dayjs';
import { AttendanceFormModal } from './AttendanceFormModal';
import { AttendanceDetailsDrawer } from './AttendanceDetailsDrawer';
import { attendanceApi } from '../api/attendanceApi';

interface AttendanceTableProps {
    isAdmin: boolean;
    dataSource: AttendanceDto[];
    loading?: boolean;
    onDelete?: (id: number) => void;
    onRefresh?: () => void;
}

export const AttendanceTable = ({ isAdmin, dataSource, loading, onDelete, onRefresh }: AttendanceTableProps) => {
    const { message } = App.useApp();
    const [editRecord, setEditRecord] = useState<AttendanceDto | null>(null);
    const [viewRecord, setViewRecord] = useState<AttendanceDto | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);

    const handleEdit = (record: AttendanceDto) => {
        setEditRecord(record);
        setIsEditModalOpen(true);
    };

    const handleView = (record: AttendanceDto) => {
        setViewRecord(record);
        setIsViewDrawerOpen(true);
    };

    const handleDelete = (recordId: number) => {
        onDelete?.(recordId);
    };

    const columns = [
        {
            title: <span style={{ paddingLeft: 12 }}>Work Date</span>,
            dataIndex: 'workDate',
            key: 'workDate',
            render: (val: string) => <span style={{ paddingLeft: 12 }}>{dayjs(val).format('DD/MM/YYYY')}</span>
        },
        {
            title: 'Employee',
            dataIndex: 'employeeName',
            key: 'employeeName',
            hidden: !isAdmin,
            render: (text: string, record: AttendanceDto) => (
                <Space orientation="vertical" size={0}>
                    <strong>{text}</strong>
                    <span style={{ fontSize: '12px', color: '#888' }}>{record.employeeCode}</span>
                </Space>
            )
        },
        {
            title: 'Time',
            key: 'time',
            render: (_: any, record: AttendanceDto) => (
                <Space orientation="vertical" size={0}>
                    <span>In: {record.checkIn ? dayjs(record.checkIn).format('HH:mm') : '--:--'}</span>
                    <span>Out: {record.checkOut ? dayjs(record.checkOut).format('HH:mm') : '--:--'}</span>
                </Space>
            )
        },
        {
            title: 'Hours',
            dataIndex: 'workHours',
            key: 'workHours',
            render: (val: number) => val ? `${val}h` : '-'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: AttendanceStatus, record: AttendanceDto) => {
                let color = 'default';
                switch (status) {
                    case AttendanceStatus.Present: color = 'green'; break;
                    case AttendanceStatus.Late: color = 'warning'; break;
                    case AttendanceStatus.Absent: color = 'error'; break;
                    case AttendanceStatus.HalfDay: color = 'blue'; break;
                    case AttendanceStatus.Leave: color = 'purple'; break;
                }
                return <Tag color={color}>{record.statusDisplay}</Tag>;
            }
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            ellipsis: true
        },
        {
            title: 'Action',
            key: 'action',
            width: 70,
            fixed: 'right',
            render: (_: any, record: AttendanceDto) => (isAdmin ? (
                <Space size={-8}>
                    <Tooltip title="Edit">
                        <Button type="text" shape="circle" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Delete this record?"
                            description="Are you sure to delete this attendance record?"
                            onConfirm={() => handleDelete(record.recordId)}
                            okText="Yes"
                            cancelText="No"
                            placement="left"
                        >
                            <Button type="text" danger shape="circle" size="small" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ) : (
                <Tooltip title="Details">
                    <Button type="text" shape="circle" icon={<InfoCircleOutlined />} onClick={() => handleView(record)} />
                </Tooltip>
            ))
        }
    ].filter(c => !c.hidden);

    return (
        <>
            <Table
                dataSource={dataSource}
                columns={columns as any}
                rowKey="recordId"
                pagination={{ pageSize: 10 }}
                size="middle"
                scroll={{ x: 'max-content' }}
                loading={loading}
            />
            <AttendanceFormModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={onRefresh}
                record={editRecord}
            />
            <AttendanceDetailsDrawer
                open={isViewDrawerOpen}
                onClose={() => setIsViewDrawerOpen(false)}
                record={viewRecord}
            />
        </>
    );
};