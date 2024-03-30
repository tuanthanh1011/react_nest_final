import { Card, Col, Row, Statistic } from "antd";
import CountUp from "react-countup";

const DashboardPage = () => {
  const formatter = (value: number | string) => {
    return <CountUp end={Number(value)} separator="," />;
  };

  return (
    <Row gutter={[20, 20]}>
      <Col span={24} md={8}>
        <Card title="Card title" bordered={false}>
          <Statistic title="Active Users" value={150} formatter={formatter} />
        </Card>
      </Col>
      <Col span={24} md={8}>
        <Card title="Card title" bordered={false}>
          <Statistic
            title="Active Companies"
            value={45}
            formatter={formatter}
          />
        </Card>
      </Col>
      <Col span={24} md={8}>
        <Card title="Card title" bordered={false}>
          <Statistic title="Active Jobs" value={125} formatter={formatter} />
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardPage;
