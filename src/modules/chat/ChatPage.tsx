import React, { useState, useRef, useEffect } from 'react';
import { Layout, Avatar, Badge, Input, Button, Typography } from 'antd';
import {
    SearchOutlined,
    PaperClipOutlined,
    SmileOutlined,
    SendOutlined,
    TeamOutlined,
    SettingOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;
const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Channel {
    id: number;
    name: string;
    lastMsg: string;
    unread: number;
    color: string;
    bg: string;
}

interface DirectMessage {
    id: number;
    name: string;
    initials: string;
    color: string;
    bg: string;
    online: boolean;
}

interface Message {
    id: number;
    senderId: number;   // 0 = current user
    sender: string;
    initials: string;
    color: string;
    bg: string;
    text: string;
    time: string;
    reactions?: { emoji: string; count: number }[];
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const mockChannels: Channel[] = [
    { id: 1, name: 'General', lastMsg: 'Chào mọi người!', unread: 2, color: '#185FA5', bg: '#E6F1FB' },
    { id: 2, name: 'Project Alpha', lastMsg: 'Deadline là ngày mai nhé', unread: 0, color: '#0F6E56', bg: '#E1F5EE' },
    { id: 3, name: 'Team Dev', lastMsg: 'Đã push code lên server', unread: 5, color: '#854F0B', bg: '#FAEEDA' },
    { id: 4, name: 'HR & Tuyển dụng', lastMsg: 'Phỏng vấn lúc 2h chiều', unread: 0, color: '#993556', bg: '#FBEAF0' },
];

const mockDMs: DirectMessage[] = [
    { id: 10, name: 'Anh Tuấn', initials: 'AT', color: '#185FA5', bg: '#E6F1FB', online: true },
    { id: 11, name: 'Minh Linh', initials: 'ML', color: '#0F6E56', bg: '#E1F5EE', online: true },
    { id: 12, name: 'Thu Phương', initials: 'TP', color: '#854F0B', bg: '#FAEEDA', online: false },
];

const mockMessages: Message[] = [
    {
        id: 1, senderId: 10, sender: 'Anh Tuấn', initials: 'AT', color: '#185FA5', bg: '#E6F1FB',
        text: 'Chào mọi người! Hôm nay có họp team lúc 10h nhé 📅', time: '08:30',
        reactions: [{ emoji: '👍', count: 3 }, { emoji: '✅', count: 2 }],
    },
    {
        id: 2, senderId: 11, sender: 'Minh Linh', initials: 'ML', color: '#0F6E56', bg: '#E1F5EE',
        text: 'Ok anh, em sẽ chuẩn bị báo cáo tiến độ sprint tuần này ạ.', time: '08:45',
    },
    {
        id: 3, senderId: 0, sender: 'Phú (bạn)', initials: 'P', color: '#993556', bg: '#FBEAF0',
        text: 'Dạ em đang hoàn thiện module Chat ạ, sẽ demo trong buổi họp!', time: '08:47',
    },
    {
        id: 4, senderId: 12, sender: 'Thu Phương', initials: 'TP', color: '#854F0B', bg: '#FAEEDA',
        text: 'Team HR thông báo: CV ứng viên mới đã gửi vào mail chung, mọi người check nhé 📨', time: '09:00',
        reactions: [{ emoji: '👀', count: 4 }],
    },
    {
        id: 5, senderId: 0, sender: 'Phú (bạn)', initials: 'P', color: '#993556', bg: '#FBEAF0',
        text: 'Chào Phương, em đã xem qua rồi. Ứng viên cho vị trí Frontend khá ổn!', time: '09:05',
    },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

const OnlineDot: React.FC<{ online: boolean }> = ({ online }) => (
    <span
        style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 9, height: 9, borderRadius: '50%',
            background: online ? '#1D9E75' : '#aaa',
            border: '1.5px solid #fff',
        }}
    />
);

const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
    const isMe = msg.senderId === 0;
    return (
        <div style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 10, marginBottom: 16 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                    style={{ background: msg.bg, color: msg.color, fontWeight: 500, fontSize: 12 }}
                    size={34}
                >
                    {msg.initials}
                </Avatar>
            </div>

            {/* Body */}
            <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                    <Text strong style={{ fontSize: 12 }}>{msg.sender}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{msg.time}</Text>
                </div>

                {/* Bubble */}
                <div
                    style={{
                        padding: '8px 12px',
                        borderRadius: isMe ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                        fontSize: 13,
                        lineHeight: 1.6,
                        background: isMe ? '#185FA5' : '#f5f5f5',
                        color: isMe ? '#fff' : '#222',
                        border: isMe ? 'none' : '0.5px solid #ebebeb',
                    }}
                >
                    {msg.text}
                </div>

                {/* Reactions */}
                {msg.reactions && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        {msg.reactions.map((r, i) => (
                            <span
                                key={i}
                                style={{
                                    background: '#f0f0f0', border: '0.5px solid #e0e0e0',
                                    borderRadius: 12, padding: '2px 7px', fontSize: 11, cursor: 'pointer',
                                }}
                            >
                                {r.emoji} {r.count}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ChatPage: React.FC = () => {
    const [activeChannelId, setActiveChannelId] = useState<number>(1);
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const [inputValue, setInputValue] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const activeChannel = mockChannels.find(c => c.id === activeChannelId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        const text = inputValue.trim();
        if (!text) return;
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newMsg: Message = {
            id: Date.now(), senderId: 0, sender: 'Phú (bạn)',
            initials: 'P', color: '#993556', bg: '#FBEAF0', text, time,
        };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');
        setIsTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { handleSend(); return; }
        setIsTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 1500);
    };

    const filteredChannels = mockChannels.filter(c =>
        c.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    const filteredDMs = mockDMs.filter(d =>
        d.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <Layout
            style={{
                height: 'calc(100vh - 112px)',
                background: '#fff',
                borderRadius: 10,
                overflow: 'hidden',
                border: '0.5px solid #ebebeb',
            }}
        >
            {/* ── Sidebar ───────────────────────────────────────────── */}
            <Sider width={260} theme="light" style={{ background: '#fafafa', borderRight: '0.5px solid #ebebeb' }}>
                {/* Workspace header */}
                <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #ebebeb' }}>
                    <Text strong style={{ fontSize: 13, color: '#666', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        EMS Workspace
                    </Text>
                </div>

                {/* Search */}
                <div style={{ padding: '10px 12px', borderBottom: '0.5px solid #ebebeb' }}>
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bbb', fontSize: 12 }} />}
                        placeholder="Tìm kiếm..."
                        size="small"
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        style={{ borderRadius: 6, fontSize: 12 }}
                    />
                </div>

                {/* Channels */}
                <div style={{ padding: '10px 14px 4px', fontSize: 11, color: '#aaa', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                    Kênh
                </div>
                {filteredChannels.map(ch => (
                    <div
                        key={ch.id}
                        onClick={() => setActiveChannelId(ch.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 14px', cursor: 'pointer', borderRadius: 6,
                            margin: '1px 6px',
                            background: activeChannelId === ch.id ? '#fff' : 'transparent',
                            boxShadow: activeChannelId === ch.id ? '0 0 0 0.5px #ebebeb' : 'none',
                            transition: 'all 0.15s',
                        }}
                    >
                        <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: ch.bg, color: ch.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 500, fontSize: 13, flexShrink: 0,
                        }}>
                            #
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Text strong style={{ fontSize: 13, display: 'block' }}>{ch.name}</Text>
                            <Text type="secondary" ellipsis style={{ fontSize: 11, width: 130 }}>{ch.lastMsg}</Text>
                        </div>
                        {ch.unread > 0 && <Badge count={ch.unread} size="small" />}
                    </div>
                ))}

                {/* DMs */}
                <div style={{ padding: '12px 14px 4px', fontSize: 11, color: '#aaa', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                    Tin nhắn trực tiếp
                </div>
                {filteredDMs.map(dm => (
                    <div
                        key={dm.id}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '7px 14px', cursor: 'pointer', borderRadius: 6,
                            margin: '1px 6px',
                        }}
                    >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <Avatar size={28} style={{ background: dm.bg, color: dm.color, fontSize: 11, fontWeight: 500 }}>
                                {dm.initials}
                            </Avatar>
                            <OnlineDot online={dm.online} />
                        </div>
                        <Text style={{ fontSize: 13 }}>{dm.name}</Text>
                    </div>
                ))}
            </Sider>

            {/* ── Main chat area ────────────────────────────────────── */}
            <Content style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{
                    padding: '12px 18px', borderBottom: '0.5px solid #ebebeb',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#fff',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: activeChannel?.bg, color: activeChannel?.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 500, fontSize: 14,
                        }}>
                            #
                        </div>
                        <div>
                            <Text strong style={{ fontSize: 15, display: 'block' }}>{activeChannel?.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>12 thành viên · kênh chung của công ty</Text>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <Button icon={<SearchOutlined />} size="small" />
                        <Button icon={<TeamOutlined />} size="small" />
                        <Button icon={<SettingOutlined />} size="small" />
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, padding: '16px 18px', overflowY: 'auto', background: '#fff' }}>
                    <div style={{
                        textAlign: 'center', fontSize: 11, color: '#bbb',
                        marginBottom: 16, position: 'relative',
                    }}>
                        <span style={{
                            background: '#fff', padding: '0 10px',
                            position: 'relative', zIndex: 1,
                        }}>
                            Hôm nay
                        </span>
                        <div style={{
                            position: 'absolute', top: '50%', left: 0, right: 0,
                            height: '0.5px', background: '#ebebeb', zIndex: 0,
                        }} />
                    </div>

                    {messages.map(msg => (
                        <MessageBubble key={msg.id} msg={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '12px 18px', borderTop: '0.5px solid #ebebeb', background: '#fff' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        border: '0.5px solid #d9d9d9', borderRadius: 10,
                        padding: '7px 10px', background: '#fafafa',
                    }}>
                        <Button icon={<PaperClipOutlined />} type="text" size="small" style={{ color: '#aaa' }} />
                        <Input
                            variant="borderless" // Sử dụng variant thay vì bordered
                            placeholder={`Nhắn tin tới #${activeChannel?.name}...`}
                            style={{ flex: 1, fontSize: 13, background: 'transparent' }}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <Button icon={<SmileOutlined />} type="text" size="small" style={{ color: '#aaa' }} />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            size="small"
                            onClick={handleSend}
                            style={{ borderRadius: 6 }}
                        >
                            Gửi
                        </Button>
                    </div>
                    {isTyping && (
                        <Text type="secondary" style={{ fontSize: 11, marginTop: 5, display: 'block', paddingLeft: 4 }}>
                            Bạn đang nhập...
                        </Text>
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default ChatPage;