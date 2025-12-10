export interface LowBitrateSources {
    folder: string;
    text_uuid: string;
    video_uuid: string;
}

export interface MainSceneConfig {
    scene_uuid: string;
    sources: {
        low_bitrate: LowBitrateSources;
    }
}

export interface OBSConfig {
    websocket: {
        password: string;
        authentication: boolean;
        url: string;
    }
}

export interface APIConfig {
    host: string;
    port: number;
    ratelimit: {
        requests: number;
    }
}

export interface Config {
    main_scene: MainSceneConfig;
    low_bitrate_actions: {
        screen_text: number;
        screen_animated_video: number;
    }
}

export interface Role {
    permissions: PermissionSet;
}

export interface PermissionSet {
    stream: {
        toggle: boolean;
        set_bitrate: boolean;
    }
    ingest: {
        select: boolean;
        manage: boolean;
    }
    remote_obs: {
        view: boolean;
        input: boolean;
    }
    logs: {
        view: boolean;
    }
    roles: {
        new: boolean;
        modify: boolean;
        view: boolean;
    }
    permissions: {
        new: boolean;
        manage: boolean
    }
}