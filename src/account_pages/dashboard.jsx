import React, { useEffect, useState } from 'react';
import {
    Navbar, Box, Collapse, Tooltip, UnstyledButton, Stack, Group, Avatar, Text, createStyles,
    BackgroundImage, Center, Title, Menu
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconLogout, IconSettings, IconHelp, IconHome, IconInfoCircle } from '@tabler/icons';
import { Link, useLocation } from "react-router-dom";
import { getServerInfo } from '../server_info.jsx';
import { authenticated_delete } from '../auth.jsx';

const API_BASE_URL = "https://api.serverguard.xyz/" // http://localhost:5000/ // https://api.serverguard.xyz/

const useStyles = createStyles((theme) => ({
    aside: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
        borderRight: `1px solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[3]
        }`,
    },
    
    serverLink: {
        width: 50,
        height: 50,
        borderRadius: theme.radius.sm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
        
        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
        },
    },
    
    active: {
        '&, &:hover': {
            backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
            color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        },
    },
    
    link: {
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
        padding: `0 ${theme.spacing.md}px`,
        fontSize: theme.fontSizes.md,
        marginRight: theme.spacing.md,
        fontWeight: 500,
        height: 44,
        lineHeight: '44px',
        width: '100%',
        cursor: 'pointer',
        
        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
            color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        },
    },
    
    linkDisabled: {
        opacity: .5,
        cursor: 'unset',

        '&:hover': {
            color: 'unset',
        },
    },
    
    linkActive: {
        '&, &:hover': {
            borderLeftColor: theme.fn.variant({ variant: 'filled', color: theme.primaryColor })
            .background,
            backgroundColor: theme.fn.variant({ variant: 'filled', color: theme.primaryColor })
            .background,
            color: theme.white,
        },
    },
    
    chevron: {
        transition: 'transform 200ms ease',
    },
    
    control: {
        fontWeight: 500,
        display: 'block',
        width: '100%',
        padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        fontSize: theme.fontSizes.sm,
        
        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
            color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        },
    },
    
    user: {
        display: 'block',
        width: '100%',
        padding: theme.spacing.md,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        borderRadius: theme.radius.sm,
        
        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
        },
    },
}));

export class NavChoice {
    disabled = false;
    icon = IconHome;
    link = undefined

    constructor(icon, disabled, link) {
        this.icon = icon || IconHome;
        this.disabled = disabled == true;
        this.link = link || undefined;
    }
}

function getFirstNavItem(list) {
    for (const [name, element] of Object.entries(list)) {
        if (element instanceof NavChoice) {
            return name;
        }
        else if (element.constructor == Object) {
            let first = getFirstNavItem(element);
            if (first !== null && first !== undefined) {
                return first;
            }
        }
        else {
            console.error(`Expected an array or NavChoice, got '${typeof element}' instead`);
        }
    }
}

function renderItem(props, name, item, selected, setSelected) {
    const { classes, theme, cx } = useStyles();

    if (item instanceof NavChoice) {
        var onClick = () => {
            setSelected(name);
        }
        if (item?.link !== undefined && item?.link !== null && item.disabled !== true) {
            return (
                <Link style={{textDecoration: 'none'}} to={item.link}>
                    <button style={{border: 'none', backgroundColor: 'transparent', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}} className={cx(classes.link, { [classes.linkActive]: selected == name }, { [classes.linkDisabled]: item.disabled })} onClick={onClick} disabled={item.disabled}>
                        <item.icon style={{marginRight: theme.spacing.md, minWidth: 24}} size={24} stroke={1.5} />
                        {name}
                    </button>
                </Link>
            )
        } else {
            return (
                <button style={{border: 'none', backgroundColor: 'transparent', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}} className={cx(classes.link, { [classes.linkActive]: selected == name }, { [classes.linkDisabled]: item.disabled })} onClick={onClick} disabled={item.disabled}>
                    <item.icon style={{marginRight: theme.spacing.md, minWidth: 24}} size={24} stroke={1.5} />
                    {name}
                </button>
            )
        }
    }
    else if (item.constructor == Object) {
        const [opened, setOpened] = useState(true);
        const ChevronIcon = theme.dir === 'ltr' ? IconChevronRight : IconChevronLeft;
        let items = {};
        let itemList = [];
        for (const [name, element] of Object.entries(item)) {
            let newItem = renderItem(props, name, element, selected, setSelected);
            items[name] = newItem;
            itemList.push(newItem)
        }
        
        return (
            <>
                <UnstyledButton onClick={() => setOpened((o) => !o)} className={classes.control}>
                    <Group position="apart" spacing={0}>
                    <Box sx={{ display: 'flex', alignItems: 'center', fontSize: theme.fontSizes.lg }}>
                        <Box style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}} ml="md">{name}</Box>
                    </Box>
                    <ChevronIcon
                        className={classes.chevron}
                        size={16}
                        stroke={1.5}
                        style={{
                            transform: opened ? `rotate(${theme.dir === 'rtl' ? -90 : 90}deg)` : 'none',
                        }}
                    />
                    </Group>
                </UnstyledButton>
                <Collapse in={opened}>{itemList}</Collapse>
            </>
        )
    }
    else {
        console.error(`Expected an array or NavChoice, got '${typeof element}' instead`);
    }
}

function logout() {
    authenticated_delete(API_BASE_URL + 'auth')
        .then(() => {
            location.assign('https://serverguard.xyz/login');
        });
}

function blurBanner(link) {
    const re = new RegExp(/-Hero\.png\??[a-zA-Z0-9=&]*/);
    return link.replace(re, '-SmallBlurred.jpg');
}

function ServerNavLink(props) {
    const { classes, cx } = useStyles();
    if (props.href !== undefined) {
        return (
            <Tooltip zIndex={2} label={props.label} position="right" transitionDuration={150}>
                <a href={props.href} disabled={props.disabled} className='link-wrap'>
                    <UnstyledButton className={cx(classes.serverLink, { [classes.active]: props.selected })}>
                        <img src={props.img} alt={props.label} disabled={props.disabled} className={`dash-server-icon${(props.selected == true) ? " selected" : ""}`} />
                    </UnstyledButton>
                </a>
            </Tooltip>
        );
    } else {
        return (
            <Tooltip zIndex={2} label={props.label} position="right" transitionDuration={150}>
                <Link to={props.link} disabled={props.disabled} className='link-wrap'>
                    <UnstyledButton className={cx(classes.serverLink, { [classes.active]: props.selected })}>
                        <img src={props.img} alt={props.label} disabled={props.disabled} className={`dash-server-icon${(props.selected == true) ? " selected" : ""}`} />
                    </UnstyledButton>
                </Link>
            </Tooltip>
        );
    }
}

export function ServerNavigation(props) {
    var user = props.user;
    var server = props.server;

    var height = '100vh';
    var width = { base: 80 };
    if (props.screenWidth <= 490) {
        height = `calc(100vh - 43px)`;
    }

    return (
        <Navbar style={{zIndex: 1100}} height={height} width={width} p="sm">
            <Navbar.Section grow mt={5}>
                <Stack justify="center" spacing={10}>
                    <ServerNavLink link="/" img="/images/logo.svg" label="Home" />
                    {user.guilds.map((guild, index) => (guild.active == false) ? null : <ServerNavLink link={`/servers/${guild.id}`} selected={guild.id == server.id} label={guild.name} disabled={guild.active == false} img={(guild.avatar != null) ? guild.avatar : "https://img.guildedcdn.com/asset/DefaultUserAvatars/profile_1.png"} />)}
                </Stack>
            </Navbar.Section>
        </Navbar>
    )
}

export function Navigation(props) {
    const { classes, theme } = useStyles();
    var user = props.user;
    var first = getFirstNavItem(props.choices);
    if ((first == undefined || first == null) && props.default == undefined) {
        console.error('Could find no default choice');
    }
    if (props.default !== undefined) {
        first = props.default;
    }

    var height = '100vh';
    var width = { base: 300 };
    var menuWidth = 280;
    if (props.screenWidth <= 490) {
        height = `calc(100vh - 43px)`;
        width = { base: props.screenWidth - 75 };
        menuWidth = 190;
    }

    const [serverData, setServerData] = useState(0);
    getServerInfo(props.server.id)
        .then((data) => {
            setServerData(data);
        })

    const [selected, setSelected] = useState(first);
    useEffect(() => {
        if (props.default !== undefined) {
            setSelected(props.default);
        }
    }, [props]);

    var listItems = [];

    for (const [name, element] of Object.entries(props.choices)) {
        listItems.push(renderItem(props, name, element, selected, setSelected));
    }

    return (
        <Navbar className={classes.aside} height={height} width={width} p="sm">
            <Navbar.Section style={{height: 62}}>
                <BackgroundImage
                    src={(serverData?.team?.teamDashImage !== undefined && serverData?.team?.teamDashImage !== null) ? blurBanner(serverData.team.teamDashImage) : props.server?.banner}
                    radius='sm'
                >
                    <Center p='md'>
                        <Title truncate order={3} color='white'>{props.server.name}</Title>
                    </Center>
                </BackgroundImage>
            </Navbar.Section>
            <Navbar.Section style={{maxHeight: `calc(100vh - 163px)`, overflowY: 'scroll'}} grow mt={5}>
                <Stack justify="center" spacing={10}>
                    {listItems}
                </Stack>
            </Navbar.Section>
            <Navbar.Section style={{height: 72}} mt={5}>
                <Menu withArrow width={menuWidth} position="bottom" transition="pop">
                    <Menu.Target>
                        <UnstyledButton className={classes.user}>
                            <Group>
                                <Avatar src={user.avatar} radius="xl" />

                                <div style={{ flex: 1 }}>
                                    <Text truncate size="sm" weight={500}>
                                        {user.name}
                                    </Text>

                                    <Text truncate color="dimmed" size="xs">
                                        {user.id}
                                    </Text>
                                </div>

                                <IconChevronRight size={14} stroke={1.5} />
                            </Group>
                        </UnstyledButton>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item component="a" href="https://serverguard.xyz/support" icon={<IconHelp size={22} stroke={1.5} />}>Support Server</Menu.Item>
                        <Menu.Item component="a" href="https://serverguard.xyz/docs" icon={<IconInfoCircle size={22} stroke={1.5} />}>Documentation</Menu.Item>

                        <Menu.Divider />

                        <Menu.Item disabled icon={<IconSettings size={22} stroke={1.5} />}>Settings</Menu.Item>
                        <Menu.Item icon={<IconLogout color={theme.colors.red[6]} size={22} stroke={1.5} />}>Logout</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Navbar.Section>
        </Navbar>
    )
}