import { Injectable } from '@angular/core';
import {IOService} from "./io.service";
import {CameraService} from "./camera.service";
import {Subject, Subscription} from "rxjs";
import {RTCAnswer, RTCCandidate, RTCOffer} from "../../../../web-shared/rtc";
import {Utils} from "../../../../web-shared/utils";

// Thanks https://webrtc.ventures/2020/04/the-basics-of-a-webrtc-broadcasting-app/
@Injectable({ providedIn: 'root' })
export class RTCService {

  private readonly UPDATE = new Subject<boolean>();

  private peers: string[];
  private peerConnections: { [key: string]: RTCPeerConnection } = {};
  private peerStreams: { [key: string]: MediaStream } = {};

  private videoStream: MediaStream;

  private subscriptionAnswers: Subscription;
  private subscriptionCandidates: Subscription;
  private subscriptionOffers: Subscription;
  private subscriptionPeers: Subscription;
  private subscriptionVideoStream: Subscription;

  constructor(
    private camera: CameraService,
    private io: IOService,
  ) {
    this.subscriptionAnswers = this.io.rtcAnswers$.subscribe(value => this.onAnswer(value));
    this.subscriptionCandidates = this.io.rtcCandidates$.subscribe(value => this.onCandidate(value));
    this.subscriptionOffers = this.io.rtcOffers$.subscribe(value => this.onOffer(value));
    this.subscriptionPeers = this.io.rtcPeers$.subscribe(value => this.onPeers(value));
    this.subscriptionVideoStream = this.camera.videoStream$.subscribe(value => this.onVideoStream(value));
  }

  get update$() { return this.UPDATE.asObservable() }

  reset() {
    this.peers = undefined;
    this.peerConnections = {};
    this.peerStreams = {};

    this.videoStream = undefined;
  }

  stream(id: string) {
    return this.peerStreams[id];
  }

  stop() {
    Utils.objectValues(this.peerConnections).forEach(value => value.close());
  }

  private broadcast() {
    if (this.peers == undefined || this.videoStream == undefined) return;

    this.peers
      .filter(peer => !this.peerConnections[peer])
      .forEach(peer => {
        console.log('creating connection for', peer)
        let connection = this.peerConnections[peer] = new RTCPeerConnection(this.RTCPeerConnectionConfiguration);
            connection.onicecandidate = event => event.candidate && this.io.rtcCandidate({
              sdpCandidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              to: peer,
            });

        this.videoStream.getVideoTracks().forEach(value => connection.addTrack(value, this.videoStream));

        connection.createOffer()
          .then(value => connection.setLocalDescription(value)
            .then(() => this.io.rtcOffer({ sdp: value.sdp, to: peer })));
      });
  }

  private onAnswer(value: RTCAnswer) { console.log('onAnswer', value); this.peerConnections[value.from]?.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: value.sdp })) }
  private onCandidate(value: RTCCandidate) { console.log('onCandidate', value); this.peerConnections[value.from]?.addIceCandidate(new RTCIceCandidate({ candidate: value.sdpCandidate, sdpMLineIndex: value.sdpMLineIndex })) }
  private onOffer(value: RTCOffer) {
    console.log('onOffer', value);
    let peer = value.from;
    let connection = this.peerConnections[peer] = new RTCPeerConnection(this.RTCPeerConnectionConfiguration);
        connection.onicecandidate = event => event.candidate && this.io.rtcCandidate({
          sdpCandidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          to: peer,
        });
        connection.ontrack = event => {
          console.log('onTrack', event.streams[0]);
          this.peerStreams[peer] = event.streams[0];
          this.UPDATE.next(true);
        }

        connection.setRemoteDescription({ type: 'offer', sdp: value.sdp });
        connection.createAnswer()
          .then(value => connection.setLocalDescription(value)
            .then(() => this.io.rtcAnswer({ sdp: value.sdp, to: peer })));
  }

  private onPeers(value: string[]) {
    this.peers = value;

    // Close connections for peers that no longer exist
    Utils.objectKeys(this.peerConnections)
      .filter(value => !this.peers.includes(value as string))
      .forEach(value => {
        this.peerConnections[value]?.close();

        delete this.peerConnections[value];
      });

    this.broadcast();
  }

  private onVideoStream(stream: MediaStream) {
    // Update tracks on existing connections
    if (stream) {
      Utils.objectValues(this.peerConnections).forEach(connection => connection.getSenders().forEach(value => connection.removeTrack(value)));
      Utils.objectValues(this.peerConnections).forEach(connection => stream.getVideoTracks().forEach(value => connection.addTrack(value, stream)));
    }

    this.videoStream = stream;
    this.broadcast();
  }

  private get RTCPeerConnectionConfiguration() {
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ]
    }
  }

}
