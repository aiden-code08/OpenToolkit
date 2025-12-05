
import { EventEmitter } from "events";
import { Request, Response } from "express";
import WebSocket from "ws";
import { BaseSession } from "../session";

export interface RTMP_Stats {
    rtmp: {
        nginx_version: string,
        nginx_rtmp_version: string,
        built: string,
        pid: number,
        uptime: number,
        naccepted: number,
        bw_in: number,
        bytes_in: number,
        bw_out: number,
        bytes_out: number,
        server: RTMP_Stats_Server
    }
}

export interface RTMP_Stats_Server {
    application: {
        name: string,
        live: {
            stream: RTMP_Stream | RTMP_Stream[]
            nclients: number
        }
    }
}

export interface RTMP_Stream {
    name: string;
    time: number;
    bw_in: number;
    bytes_in: number;
    bw_out: number;
    bytes_out: number;
    bw_audio: number;
    bw_video: number;
    client: {
        id: number;
        address: string;
        time: number;
        flashver: string;
        swfurl: string;
        dropped: number;
        avsync: number;
        timestamp: number;
        publishing: string;
        active: string;
    };
    meta: {
        video: {
            width: number;
            height: number;
            frame_rate: number;
            codec: string;
            profile: string;
            compat: number;
            level: number;
        };
        audio: {
            codec: string;
            profile: string;
            channels: number;
            sample_rate: number;
        };
    };
    nclient: number;
    publishing: string;
    active: string;
}

export interface Connection {
    /**
     * Stream key
     */
    key: string

    /**
     * Address
     */
    address: string

    /**
     * Kbps
     * bw / 1000
     */
    bitrate: number

    /**
     * Kbps
     * time / 1000
     */
    uptime: number
}

export interface Config {
    main_scene: {
        scene_uuid: string,
        sources: {
            ingest_uuid: string,
            chat_uuid: string
            desktop_uuid: string,
            low_bitrate: {
                folder: string,
                text_uuid: string,
                text_input: string
            }
        },
    },
    low_bitrate_actions: {
        screen_text: number,
        screen_animated_video: number
    },
}

export interface Logger {
    trace(message: string): void;
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

export interface AVPacket {
    codec_id: number;
    codec_type: number;
    duration: number;
    flags: number;
    pts: number;
    dts: number;
    size: number;
    offset: number;
    data: Buffer;
}

export interface Amf0Cmd {
    cmd: string;
    transId: number;
    cmdObj: any;
    info?: any;
    streamId?: any;
    args?: any;
    streamName?: any;
    start?: any;
    duration?: any;
    reset?: any;
    params?: any;
    bool?: any;
    ms?: any;
    pause?: any;
    type?: any;
}

export interface Amf0Data {
    cmd: string;
    method?: any;
    dataObj?: any;
    info?: any;
    bool1?: any;
    bool2?: any;
}

export interface AMF {
    decodeAmf0Cmd(buffer: Buffer): Amf0Cmd;
    encodeAmf0Cmd(cmd: Amf0Cmd): Buffer;
    decodeAmf0Data(buffer: Buffer): Amf0Data;
    encodeAmf0Data(data: Amf0Data): Buffer;
    amf0Encode(data: any[]): Buffer;
    amf0EncodeOne(data: any): Buffer;
    amf0Decode(buffer: Buffer): any[];
    amf0DecodeOne(buffer: Buffer): any;
}

export interface Flv {
    onPacketCallback: (avpacket: AVPacket) => void;
    parserData: (buffer: Buffer) => string | null;
    createHeader: (hasAudio: boolean, hasVideo: boolean) => Buffer;
    createMessage: (avpacket: AVPacket) => Buffer;
    parserTag: (type: number, time: number, size: number, data: Buffer) => AVPacket;
}

export interface RtmpPacket {
    header: {
        fmt: number;
        cid: number;
        timestamp: number;
        length: number;
        type: number;
        stream_id: number;
    };
    clock: number;
    payload: Buffer;
    capacity: number;
    bytes: number;
}

export interface Rtmp {
    onConnectCallback: (req: any) => void;
    onPlayCallback: () => void;
    onPushCallback: () => void;
    onPacketCallback: (avpacket: AVPacket) => void;
    onOutputCallback: (buffer: Buffer) => void;
    parserData: (buffer: Buffer) => string | null;
    createMessage: (avpacket: AVPacket) => Buffer;
    chunkBasicHeaderCreate: (fmt: number, cid: number) => Buffer;
    chunkMessageHeaderCreate: (header: any) => Buffer;
    chunksCreate: (packet: RtmpPacket) => Buffer;
    chunkRead: (data: Buffer, p: number, bytes: number) => string | null;
    packetParse: () => void;
    chunkMessageHeaderRead: () => number;
    packetAlloc: () => void;
    packetHandler: () => void;
    controlHandler: () => void;
    eventHandler: () => void;
    invokeHandler: () => void;
    dataHandler: () => void;
    onConnect: (invokeMessage: Amf0Cmd) => void;
    onCreateStream: (invokeMessage: Amf0Cmd) => void;
    onPublish: (invokeMessage: Amf0Cmd) => void;
    onPlay: (invokeMessage: Amf0Cmd) => void;
    onDeleteStream: (invokeMessage: Amf0Cmd) => void;
    sendACK: (size: number) => void;
    sendWindowACK: (size: number) => void;
    setPeerBandwidth: (size: number, type: number) => void;
    setChunkSize: (size: number) => void;
    sendStreamStatus: (st: number, id: number) => void;
    sendInvokeMessage: (sid: number, opt: any) => void;
    sendDataMessage: (opt: any, sid: number) => void;
    sendStatusMessage: (sid: number, level: string, code: string, description: string) => void;
    sendRtmpSampleAccess: (sid: number) => void;
    respondConnect: (tid: number) => void;
    respondCreateStream: (tid: number) => void;
    respondPublish: () => void;
    respondPlay: () => void;
}

export interface BroadcastServer {
    publisher: BaseSession | null;
    subscribers: Map<string, BaseSession>;
    flvHeader: Buffer;
    flvMetaData: Buffer | null;
    flvAudioHeader: Buffer | null;
    flvVideoHeader: Buffer | null;
    rtmpMetaData: Buffer | null;
    rtmpAudioHeader: Buffer | null;
    rtmpVideoHeader: Buffer | null;
    flvGopCache: Set<Buffer> | null;
    rtmpGopCache: Set<Buffer> | null;
    verifyAuth: (authKey: string, session: BaseSession) => boolean;
    postPlay: (session: BaseSession) => string | null;
    donePlay: (session: BaseSession) => void;
    postPublish: (session: BaseSession) => string | null;
    donePublish: (session: BaseSession) => void;
    broadcastMessage: (packet: AVPacket) => void;
}

export interface Context {
    config: any;
    sessions: Map<string, BaseSession>;
    broadcasts: Map<string, BroadcastServer>;
    eventEmitter: EventEmitter;
}