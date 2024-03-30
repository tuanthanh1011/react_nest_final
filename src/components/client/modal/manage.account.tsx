import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Tabs,
  message,
  notification,
} from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from "antd";
import { IResume } from "@/types/backend";
import { useState, useEffect } from "react";
import {
  callFetchResumeByUser,
  callGetSubscriberSkills,
  callUpdatePasswordByUser,
  callUpdateSubscriber,
} from "@/config/api";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { MonitorOutlined } from "@ant-design/icons";
import { SKILLS_LIST } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";

interface IProps {
  open: boolean;
  onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
  const [listCV, setListCV] = useState<IResume[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      setIsFetching(true);
      const res = await callFetchResumeByUser();
      if (res && res.data) {
        setListCV(res.data as IResume[]);
      }
      setIsFetching(false);
    };
    init();
  }, []);

  const columns: ColumnsType<IResume> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (text, record, index) => {
        return <>{index + 1}</>;
      },
    },
    {
      title: "Công Ty",
      dataIndex: ["companyId", "name"],
    },
    {
      title: "Vị trí",
      dataIndex: ["jobId", "name"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
    },
    {
      title: "Ngày gửi CV",
      dataIndex: "createdAt",
      render(value, record, index) {
        return <>{dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")}</>;
      },
    },
    {
      title: "",
      dataIndex: "",
      render(value, record, index) {
        return (
          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/images/resume/${
              record?.url
            }`}
            target="_blank"
          >
            Chi tiết
          </a>
        );
      },
    },
  ];

  return (
    <div>
      <Table<IResume>
        columns={columns}
        dataSource={listCV}
        loading={isFetching}
        pagination={false}
      />
    </div>
  );
};

const UserUpdateInfo = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    const { oldPassword, newPassword, confirmNewPassword } = values;

    if (newPassword !== confirmNewPassword) {
      message.error("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    try {
      const res = await callUpdatePasswordByUser({ oldPassword, newPassword }); // Gọi hàm cập nhật mật khẩu với mật khẩu mới
      if (res.data) {
        message.success("Cập nhật mật khẩu thành công");
        form.resetFields(); // Đặt lại trường nhập liệu sau khi cập nhật thành công
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      notification.error({
        message: "Có lỗi xảy ra",
        description:
          "Đã có lỗi xảy ra khi cập nhật mật khẩu, vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} onFinish={onFinish}>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Form.Item
            name="oldPassword"
            label="Mật khẩu cũ"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu cũ" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="confirmNewPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

const JobByEmail = (props: any) => {
  const [form] = Form.useForm();
  const user = useAppSelector((state) => state.account.user);

  useEffect(() => {
    const init = async () => {
      const res = await callGetSubscriberSkills();
      if (res && res.data) {
        form.setFieldValue("skills", res.data.skills);
      }
    };
    init();
  }, []);

  const onFinish = async (values: any) => {
    const { skills } = values;
    const res = await callUpdateSubscriber({
      email: user.email,
      name: user.name,
      skills: skills ? skills : [],
    });
    if (res.data) {
      message.success("Cập nhật thông tin thành công");
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description: res.message,
      });
    }
  };

  return (
    <>
      <Form onFinish={onFinish} form={form}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <Form.Item
              label={"Kỹ năng"}
              name={"skills"}
              rules={[
                { required: true, message: "Vui lòng chọn ít nhất 1 skill!" },
              ]}
            >
              <Select
                mode="multiple"
                allowClear
                showArrow={false}
                style={{ width: "100%" }}
                placeholder={
                  <>
                    <MonitorOutlined /> Tìm theo kỹ năng...
                  </>
                }
                optionLabelProp="label"
                options={SKILLS_LIST}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Button onClick={() => form.submit()}>Cập nhật</Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

const ManageAccount = (props: IProps) => {
  const { open, onClose } = props;

  const onChange = (key: string) => {
    // console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "user-resume",
      label: `Gửi CV`,
      children: <UserResume />,
    },
    {
      key: "email-by-skills",
      label: `Nhận Jobs qua Email`,
      children: <JobByEmail />,
    },
    {
      key: "reset-password",
      label: `Cập nhật mật khẩu`,
      children: <UserUpdateInfo />,
    },
  ];

  return (
    <>
      <Modal
        title="Quản lý tài khoản"
        open={open}
        onCancel={() => onClose(false)}
        maskClosable={false}
        footer={null}
        destroyOnClose={true}
        width={isMobile ? "100%" : "1000px"}
      >
        <div style={{ minHeight: 400 }}>
          <Tabs
            defaultActiveKey="user-resume"
            items={items}
            onChange={onChange}
          />
        </div>
      </Modal>
    </>
  );
};

export default ManageAccount;
