import React, { useState, useEffect } from "react"
import { Layout, Menu, Avatar, Dropdown, Space, Button, Badge, Breadcrumb, Typography, ConfigProvider, App } from "antd"
import {
    LayoutDashboard,
    Building2,
    CheckSquare,
    Calendar,
    CreditCard,
    MessageSquare,
    Bell,
    User,
    LogOut,
    ChevronLeft,
    Settings,
    HelpCircle
} from "lucide-react"
import { useNavigate, useLocation, useOutlet } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../contexts/AuthContext"
import { UserRole } from "../../modules/auth/types"

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Spring easing used by Linear, Vercel, Radix UI — feels natural & snappy
const SPRING = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_OUT = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const SIDEBAR_DURATION = 320; // ms — sidebar width
const TEXT_DURATION = 150;    // ms — label fade (fast, text disappears first)
const CONTENT_DURATION = 200; // ms — page route transition

const SIDEBAR_STYLES = `
    /* ── Base: all animated elements use GPU-friendly properties ─────────── */
    .nova-sidebar {
        will-change: width;
        transition: width ${SIDEBAR_DURATION}ms ${SPRING} !important;
    }

    /* ── Menu item base ──────────────────────────────────────────────────── */
    .nova-sidebar .ant-menu-item,
    .nova-sidebar .ant-menu-submenu-title {
        transition:
            background ${150}ms ${EASE_OUT},
            color       ${150}ms ${EASE_OUT} !important;
        will-change: transform;
    }

    /* ── Label text: max-width trick for smooth clip ─────────────────────── */
    .nova-sidebar .ant-menu-title-content {
        display: inline-block;
        max-width: 160px;
        opacity: 1;
        overflow: hidden;
        white-space: nowrap;
        transform: translateX(0px);
        transition:
            max-width   ${TEXT_DURATION}ms ${EASE_OUT},
            opacity     ${TEXT_DURATION}ms ${EASE_OUT},
            transform   ${TEXT_DURATION}ms ${EASE_OUT};
        will-change: max-width, opacity, transform;
    }

    /* ── Group title ─────────────────────────────────────────────────────── */
    .nova-sidebar .ant-menu-item-group-title {
        overflow: hidden;
        transition:
            max-height  ${TEXT_DURATION}ms ${EASE_OUT},
            opacity     ${TEXT_DURATION}ms ${EASE_OUT},
            padding     ${TEXT_DURATION}ms ${EASE_OUT};
        max-height: 48px;
        opacity: 1;
    }

    /* ── Icon ─────────────────────────────────────────────────────────────── */
    .nova-sidebar .ant-menu-item .ant-menu-item-icon,
    .nova-sidebar .ant-menu-item-group-list .ant-menu-item .ant-menu-item-icon {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0;
        transition: transform ${TEXT_DURATION}ms ${SPRING};
        will-change: transform;
    }

    /* ── EXPANDED state ──────────────────────────────────────────────────── */
    .nova-sidebar:not(.ant-layout-sider-collapsed) .ant-menu-item,
    .nova-sidebar:not(.ant-layout-sider-collapsed) .ant-menu-submenu-title,
    .nova-sidebar:not(.ant-layout-sider-collapsed) .ant-menu-item-group-list .ant-menu-item {
        padding-inline: 20px !important;
        display: flex;
        align-items: center;
    }

    /* ── COLLAPSED: text fades + clips ───────────────────────────────────── */
    .nova-sidebar.ant-layout-sider-collapsed .ant-menu-title-content {
        max-width: 0 !important;
        opacity: 0 !important;
        transform: translateX(-6px) !important;
    }

    /* Group title collapses to nothing */
    .nova-sidebar.ant-layout-sider-collapsed .ant-menu-item-group-title {
        max-height: 0 !important;
        opacity: 0 !important;
        padding: 0 !important;
    }

    /* Icon centers when collapsed */
    .nova-sidebar.ant-layout-sider-collapsed .ant-menu-item,
    .nova-sidebar.ant-layout-sider-collapsed .ant-menu-submenu-title,
    .nova-sidebar.ant-layout-sider-collapsed .ant-menu-item-group-list .ant-menu-item {
        padding: 0 !important;
        margin-inline: 12px !important;
        width: calc(100% - 24px) !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        height: 40px !important;
    }

    .nova-sidebar.ant-layout-sider-collapsed .ant-menu-item .ant-menu-item-icon,
    .nova-sidebar.ant-layout-sider-collapsed .ant-menu-item-group-list .ant-menu-item .ant-menu-item-icon {
        margin: 0 !important;
        transform: scale(1.08);
    }

    /* ── Hover micro-interaction ─────────────────────────────────────────── */
    .nova-sidebar .ant-menu-item:not(.ant-menu-item-selected):hover .ant-menu-item-icon,
    .nova-sidebar .ant-menu-item-group-list .ant-menu-item:not(.ant-menu-item-selected):hover .ant-menu-item-icon {
        transform: translateY(-1px) scale(1.05);
    }

    /* ── Profile hover ───────────────────────────────────────────────────── */
    .nova-header-profile:hover {
        background: rgba(0, 0, 0, 0.04);
    }

    /* ── Collapse toggle button ──────────────────────────────────────────── */
    .nova-collapse-btn {
        transition: background ${150}ms ${EASE_OUT} !important;
    }
    .nova-collapse-btn:hover {
        background: #e2e8f0 !important;
    }
    .nova-collapse-icon {
        transition: transform ${SIDEBAR_DURATION}ms ${SPRING};
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .nova-collapse-icon.is-collapsed {
        transform: rotate(180deg);
    }
`;

export default function MainLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const [collapsed, setCollapsed] = useState(false)
    const currentOutlet = useOutlet()

    const { user, isAuthenticated, logout } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || !user) navigate('/login');
    }, [user, isAuthenticated, navigate]);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            key: "/",
            icon: <LayoutDashboard size={18} strokeWidth={1.75} />,
            label: "Dashboard"
        },
        { type: 'divider', style: { background: 'rgba(255,255,255,0.06)', margin: '8px 0' } },

        // QUẢN LÝ group (Admin / Manager only)
        ...((user.role === UserRole.Admin || user.role === UserRole.Manager) ? [{
            key: 'admin-group',
            label: <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>QUẢN LÝ</span>,
            type: 'group',
            children: [
                { key: "/departments", icon: <Building2 size={18} strokeWidth={1.75} />, label: "Phòng ban" },
            ]
        }] : []) as any,

        // CÔNG VIỆC group
        {
            key: 'work-group',
            label: <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>CÔNG VIỆC</span>,
            type: 'group',
            children: [
                { key: "/tasks", icon: <CheckSquare size={18} strokeWidth={1.75} />, label: "Công việc" },
                { key: "/attendance", icon: <Calendar size={18} strokeWidth={1.75} />, label: "Chấm công" },
                { key: "/payroll", icon: <CreditCard size={18} strokeWidth={1.75} />, label: "Bảng lương" },
                { key: "/chat", icon: <MessageSquare size={18} strokeWidth={1.75} />, label: "Trò chuyện" },
            ]
        }
    ];

    const breadcrumbItems = location.pathname
        .split('/')
        .filter(Boolean)
        .map(seg => ({ title: seg.charAt(0).toUpperCase() + seg.slice(1) }));

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#4f46e5',
                    borderRadius: 12,
                    fontFamily: "'Inter', sans-serif"
                },
                components: {
                    Layout: {
                        siderBg: '#1e1b4b',
                        headerHeight: 64,
                        headerBg: '#ffffff'
                    },
                    Menu: {
                        darkItemBg: '#1e1b4b',
                        darkItemColor: 'rgba(255,255,255,0.55)',
                        darkItemHoverColor: '#ffffff',
                        darkItemSelectedColor: '#ffffff',
                        darkItemSelectedBg: '#4f46e5',
                        itemBorderRadius: 10,
                        itemMarginInline: 12,
                        itemMarginBlock: 3,
                        groupTitleColor: 'rgba(255,255,255,0.35)',
                    }
                }
            }}
        >
            {/* Inject animation styles once */}
            <style>{SIDEBAR_STYLES}</style>

            <App>
                <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>

                    {/* ── Sidebar ──────────────────────────────────────────── */}
                    <Sider
                        trigger={null}
                        collapsible
                        collapsed={collapsed}
                        width={200}
                        collapsedWidth={68}
                        className="nova-sidebar"
                        style={{
                            height: '100vh',
                            position: 'fixed',
                            left: 0, top: 0, bottom: 0,
                            zIndex: 100,
                            boxShadow: '4px 0 32px rgba(0,0,0,0.08)',
                            borderRight: '1px solid rgba(255,255,255,0.04)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Logo area */}
                        <div style={{
                            height: 72,
                            padding: '0 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            overflow: 'hidden',
                            flexShrink: 0,
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            marginBottom: 8,
                        }}>
                            {/* Icon — always visible, never moves */}
                            <div style={{
                                width: 32, height: 32, flexShrink: 0,
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                borderRadius: 10,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                            }}>
                                <Building2 size={18} />
                            </div>

                            {/* Text — fades & clips when collapsed */}
                            <div style={{
                                overflow: 'hidden',
                                maxWidth: collapsed ? 0 : 120,
                                opacity: collapsed ? 0 : 1,
                                transform: collapsed ? 'translateX(-8px)' : 'translateX(0)',
                                transition: `
                                    max-width ${TEXT_DURATION}ms ${EASE_OUT},
                                    opacity   ${TEXT_DURATION}ms ${EASE_OUT},
                                    transform ${TEXT_DURATION}ms ${EASE_OUT}
                                `,
                                whiteSpace: 'nowrap',
                                willChange: 'max-width, opacity, transform',
                            }}>
                                <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>NOVA</div>
                                <div style={{ color: '#818cf8', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em' }}>STAFF SYSTEM</div>
                            </div>
                        </div>

                        {/* Menu */}
                        <Menu
                            theme="dark"
                            mode="inline"
                            selectedKeys={[location.pathname]}
                            items={menuItems}
                            onClick={({ key }) => navigate(key)}
                            style={{ border: 'none', background: 'transparent', paddingTop: 4 }}
                        />

                        {/* Help card — fades out when collapsed */}
                        <div style={{
                            position: 'absolute', bottom: 20, left: 0, width: '100%',
                            padding: '0 12px',
                            opacity: collapsed ? 0 : 1,
                            transform: collapsed ? 'translateY(12px) scale(0.94)' : 'translateY(0) scale(1)',
                            transformOrigin: 'bottom center',
                            transition: `
                                opacity   ${TEXT_DURATION}ms ${EASE_OUT},
                                transform ${TEXT_DURATION}ms ${EASE_OUT}
                            `,
                            pointerEvents: collapsed ? 'none' : 'auto',
                            willChange: 'opacity, transform',
                        }}>
                            <div style={{
                                background: 'rgba(99,102,241,0.08)',
                                borderRadius: 12,
                                padding: '14px 16px',
                                border: '1px solid rgba(99,102,241,0.18)'
                            }}>
                                <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, marginBottom: 3 }}>Need Help?</div>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 10 }}>
                                    Check our docs for more info.
                                </div>
                                <Button
                                    type="primary" ghost size="small" block
                                    style={{ fontSize: 11, height: 26, borderColor: 'rgba(255,255,255,0.18)', color: '#fff' }}
                                >
                                    Documentation
                                </Button>
                            </div>
                        </div>
                    </Sider>

                    {/* ── Main content area ─────────────────────────────────── */}
                    <Layout style={{
                        marginLeft: collapsed ? 68 : 200,
                        transition: `margin-left ${SIDEBAR_DURATION}ms ${SPRING}`,
                        willChange: 'margin-left',
                    }}>
                        {/* Header */}
                        <Header style={{
                            background: "rgba(255,255,255,0.92)",
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            padding: '0 24px',
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            position: 'sticky', top: 0, zIndex: 90,
                            borderBottom: '1px solid rgba(226,232,240,0.8)',
                        }}>
                            <Space size={16}>
                                {/* Collapse toggle — single chevron that rotates */}
                                <button
                                    onClick={() => setCollapsed(!collapsed)}
                                    className="nova-collapse-btn"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: 32, height: 32,
                                        background: '#f1f5f9',
                                        border: 'none', borderRadius: 8,
                                        cursor: 'pointer', color: '#64748b',
                                    }}
                                >
                                    <span className={`nova-collapse-icon${collapsed ? ' is-collapsed' : ''}`}>
                                        <ChevronLeft size={16} strokeWidth={2} />
                                    </span>
                                </button>

                                <Breadcrumb
                                    items={[{ title: <LayoutDashboard size={14} color="#94a3b8" /> }, ...breadcrumbItems]}
                                    separator={<span style={{ color: '#cbd5e1' }}>/</span>}
                                />
                            </Space>

                            <Space size={12}>
                                <Button
                                    type="text"
                                    icon={<Calendar size={15} strokeWidth={1.75} />}
                                    style={{
                                        color: '#64748b',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: '#f1f5f9',
                                        borderRadius: 8,
                                        height: 32,
                                        padding: '0 12px'
                                    }}
                                >
                                    May 13, 2026
                                </Button>

                                <Badge count={3} size="small" offset={[-2, 2]} color="#6366f1">
                                    <Button
                                        type="text" shape="circle"
                                        icon={<Bell size={19} strokeWidth={1.75} />}
                                        style={{ color: '#64748b' }}
                                    />
                                </Badge>

                                <div style={{ width: 1, height: 22, background: '#e2e8f0' }} />

                                <Dropdown
                                    menu={{
                                        items: [
                                            { key: 'profile', icon: <User size={15} />, label: 'Thông tin cá nhân' },
                                            { key: 'settings', icon: <Settings size={15} />, label: 'Cài đặt' },
                                            { key: 'help', icon: <HelpCircle size={15} />, label: 'Trợ giúp' },
                                            { type: 'divider' },
                                            { key: 'logout', icon: <LogOut size={15} />, label: 'Đăng xuất', danger: true, onClick: handleLogout }
                                        ]
                                    }}
                                    placement="bottomRight"
                                    arrow
                                >
                                    <div
                                        className="nova-header-profile"
                                        style={{
                                            cursor: 'pointer',
                                            padding: '4px 8px',
                                            borderRadius: 10,
                                            transition: `background 150ms ${EASE_OUT}`,
                                            display: 'flex', alignItems: 'center', gap: 10,
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.3 }}>
                                            <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                                                {user.displayName || 'Người dùng'}
                                            </Text>
                                            <Text style={{ fontSize: 10, color: '#6366f1', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                                                {user.role}
                                            </Text>
                                        </div>
                                        <Avatar
                                            size={34}
                                            style={{
                                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                                boxShadow: '0 4px 12px rgba(79,70,229,0.25)',
                                                border: '2px solid #fff',
                                                flexShrink: 0,
                                            }}
                                            icon={!user.displayName && <User size={16} />}
                                        >
                                            {user.displayName?.charAt(0)}
                                        </Avatar>
                                    </div>
                                </Dropdown>
                            </Space>
                        </Header>

                        {/* Page content */}
                        <Content style={{ padding: '0px', background: '#f8fafc', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={location.pathname}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: CONTENT_DURATION / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    style={{ padding: '24px' }}
                                >
                                    {currentOutlet}
                                </motion.div>
                            </AnimatePresence>
                        </Content>
                    </Layout>
                </Layout>
            </App>
        </ConfigProvider>
    )
}