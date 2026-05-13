import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Typography, FormInstance, Switch, App } from "antd";
import { departmentApi } from "../api/departmentApi";
import { DepartmentDto } from "../types";

const { Text } = Typography;

interface Props {
    open: boolean;
    isEdit: boolean;
    onCancel: () => void;
    onSave: (values: any) => void;
    form: FormInstance;
    saving?: boolean;
}

export const DepartmentForm = ({ open, isEdit, onCancel, onSave, form, saving }: Props) => {
    const { message } = App.useApp();
    const [roots, setRoots] = useState<DepartmentDto[]>([]);
    const [loadingRoots, setLoadingRoots] = useState(false);

    // Load root departments when opening create modal
    useEffect(() => {
        if (!open || isEdit) return;

        const fetchRoots = async () => {
            setLoadingRoots(true);
            try {
                const res = await departmentApi.getRootsPaged(1, 100);
                setRoots(res.data.items);
            } catch {
                message.error("Failed to load department list");
            } finally {
                setLoadingRoots(false);
            }
        };

        fetchRoots();
    }, [open, isEdit]);

    return (
        <Modal
            title={
                <Text strong style={{ fontSize: 18 }}>
                    {isEdit ? "Update Department" : "Add New Department"}
                </Text>
            }
            open={open}
            onOk={() => form.submit()}
            onCancel={onCancel}
            okText={isEdit ? "Update" : "Create"}
            cancelText="Cancel"
            confirmLoading={saving}
            afterClose={() => form.resetFields()}
        >
            <Form form={form} layout="vertical" onFinish={onSave} style={{ paddingTop: 16 }}>
                <Form.Item
                    name="name"
                    label="Department Name"
                    rules={[{ required: true, message: "Please enter department name" }]}
                >
                    <Input placeholder="e.g. Engineering Department" />
                </Form.Item>

                <Form.Item
                    name="code"
                    label="Department Code"
                    rules={[{ required: true, message: "Please enter department code" }]}
                >
                    <Input
                        placeholder="e.g. DEPT001"
                        disabled={isEdit}
                        style={{ textTransform: 'uppercase' }}
                    />
                </Form.Item>

                {/* Show only when creating */}
                {!isEdit && (
                    <Form.Item
                        name="parentId"
                        label="Parent Department"
                    >
                        <Select
                            allowClear
                            placeholder="Leave empty for root department"
                            loading={loadingRoots}
                            showSearch
                            optionFilterProp="label"
                            options={roots.map(d => ({
                                value: d.id,
                                label: d.code ? `${d.name} (${d.code})` : d.name,
                            }))}
                        />
                    </Form.Item>
                )}

                <Form.Item name="description" label="Description / Notes">
                    <Input.TextArea placeholder="Enter description..." rows={2} />
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Active Status"
                    valuePropName="checked"
                    initialValue={true}
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};