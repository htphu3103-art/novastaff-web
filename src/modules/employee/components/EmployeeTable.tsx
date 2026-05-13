import React from "react";
import { Button, Popconfirm, Space, Table, Tag, Typography, Dropdown } from "antd";
import type { TablePaginationConfig, ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, DragOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { EmployeeDto } from "../types";
import { UserRole } from "../../auth/types";

const { Text } = Typography;

interface Props {
    loading: boolean;
    dataSource: EmployeeDto[];
    pagination?: TablePaginationConfig | false;
    onEdit: (record: EmployeeDto) => void;
    onDelete: (id: number) => Promise<void>;
    onResetPassword?: (id: number) => void;
    onUpdateRole?: (id: number, role: UserRole) => void;
    draggable?: boolean;
    onDragStart?: (record: EmployeeDto, e: React.DragEvent) => void;
    onDragEnd?: () => void;
}

const statusColorMap: Record<string, string> = {
    Active: "green",
    Inactive: "default",
    Resigned: "red",
    OnLeave: "orange",
};

export const EmployeeTable = ({ 
    loading, 
    dataSource, 
    pagination, 
    onEdit, 
    onDelete,
    onResetPassword,
    onUpdateRole,
    draggable = false,
    onDragStart,
    onDragEnd
}: Props) => {
    const columns: ColumnsType<EmployeeDto> = [
        ...(draggable ? [{
            key: "drag",
            width: 50,
            align: "center" as const,
            render: (_: unknown, record: EmployeeDto) => (
                <div
                    draggable
                    onDragStart={(e) => onDragStart?.(record, e)}
                    onDragEnd={() => onDragEnd?.()}
                    style={{ cursor: "grab", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    title="Kéo để chuyển phòng ban"
                >
                    <DragOutlined style={{ color: "#999", fontSize: 16 }} />
                </div>
            ),
        }] : []),
        {
            title: "Code",
            dataIndex: "employeeCode",
            width: 110,
            render: (value: string) => <Text strong>{value}</Text>,
        },
        {
            title: "Full name",
            dataIndex: "fullName",
            width: 180,
        },
        {
            title: "Email",
            dataIndex: "email",
            width: 200,
        },
        {
            title: "Phone",
            dataIndex: "phone",
            width: 120,
            render: (value: string | null) => value ?? "-",
        },
        {
            title: "Department",
            dataIndex: "departmentName",
            width: 150,
            render: (value: string | null) => value ?? "-",
            hidden: draggable,
        },
        {
            title: "Position",
            dataIndex: "position",
            width: 150,
            render: (value: string | null) => value ?? "-",
        },
        {
            title: "Status",
            dataIndex: "status",
            width: 110,
            render: (status: string) => (
                <Tag color={statusColorMap[status] ?? "blue"}>{status}</Tag>
            ),
        },
        {
            title: "Action",
            key: "action",
            width: 160,
            render: (_: any, record: EmployeeDto) => (
                <Space size={4}>
                    <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} title="Edit" />
                    
                    {onResetPassword && (
                        <Popconfirm
                            title="Reset Password?"
                            description={`Are you sure to reset password for ${record.fullName}?`}
                            onConfirm={() => onResetPassword(record.id)}
                        >
                            <Button type="text" size="small" icon={<LockOutlined />} title="Reset Password" />
                        </Popconfirm>
                    )}

                    {onUpdateRole && (
                        <Dropdown
                            menu={{
                                items: [
                                    { key: UserRole.Admin.toString(), label: "Admin" },
                                    { key: UserRole.Manager.toString(), label: "Manager" },
                                    { key: UserRole.Staff.toString(), label: "Staff" },
                                ],
                                onClick: (e) => onUpdateRole?.(record.id, parseInt(e.key) as UserRole),
                            }}
                            trigger={["click"]}
                        >
                            <Button type="text" size="small" icon={<SafetyOutlined />} title="Update Role" />
                        </Dropdown>
                    )}

                    <Popconfirm
                        title="Delete employee?"
                        description={`Are you sure to delete ${record.fullName}?`}
                        okButtonProps={{ danger: true }}
                        onConfirm={() => onDelete(record.id)}
                    >
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} title="Delete" />
                    </Popconfirm>
                </Space>
            ),
        },
    ].filter(c => !(c as any).hidden);

    return (
        <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            scroll={{ x: "max-content" }}
        />
    );
};