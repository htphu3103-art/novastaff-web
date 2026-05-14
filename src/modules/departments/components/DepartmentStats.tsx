import { Row, Col, Card, Typography, Skeleton } from "antd";

const { Title, Text } = Typography;

interface Props {
    totalDepts: number;
    totalMembers: number;
    loading?: boolean;
}

export const DepartmentStats = ({ totalDepts, totalMembers, loading = false }: Props) => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
            <Card variant="borderless" hoverable style={{ borderRadius: 8 }}>
                <div style={{ height: 64, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Skeleton loading={loading} active title={false} paragraph={{ rows: 2, width: ['60%', '30%'] }}>
                        <Text type="secondary">Total Departments</Text>
                        <Title level={2} style={{ margin: 0 }}>{totalDepts}</Title>
                    </Skeleton>
                </div>
            </Card>
        </Col>
        <Col span={8}>
            <Card variant="borderless" hoverable style={{ borderRadius: 8 }}>
                <div style={{ height: 64, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Skeleton loading={loading} active title={false} paragraph={{ rows: 2, width: ['60%', '30%'] }}>
                        <Text type="secondary">Total Employees</Text>
                        <Title level={2} style={{ margin: 0 }}>{totalMembers}</Title>
                    </Skeleton>
                </div>
            </Card>
        </Col>
        <Col span={8}>
            <Card variant="borderless" hoverable style={{ borderRadius: 8 }}>
                <div style={{ height: 64, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Skeleton loading={loading} active title={false} paragraph={{ rows: 2, width: ['60%', '30%'] }}>
                        <Text type="secondary">System Integrity</Text>
                        <Title level={2} style={{ margin: 0, color: '#52c41a' }}>100%</Title>
                    </Skeleton>
                </div>
            </Card>
        </Col>
    </Row>
);