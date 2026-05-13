import { Row, Col, Card, Typography } from "antd";

const { Title, Text } = Typography;

interface Props {
    totalDepts: number;
    totalMembers: number;
}

export const DepartmentStats = ({ totalDepts, totalMembers }: Props) => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
            <Card variant="borderless" hoverable style={{ borderRadius: 8 }}>
                <Text type="secondary">Total Departments</Text>
                <Title level={2} style={{ margin: 0 }}>{totalDepts}</Title>
            </Card>
        </Col>
        <Col span={8}>
            <Card variant="borderless" hoverable style={{ borderRadius: 8 }}>
                <Text type="secondary">Total Employees</Text>
                <Title level={2} style={{ margin: 0 }}>{totalMembers}</Title>
            </Card>
        </Col>
        <Col span={8}>
            <Card variant="borderless" hoverable style={{ borderRadius: 8 }}>
                <Text type="secondary">System Integrity</Text>
                <Title level={2} style={{ margin: 0, color: '#52c41a' }}>100%</Title>
            </Card>
        </Col>
    </Row>
);