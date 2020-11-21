export interface RTCAnswer {
  from?: string;
  sdp: string;
  to?: string;
}
export interface RTCCandidate {
  from?: string;
  sdpCandidate: string;
  sdpMid: string;
  sdpMLineIndex: number;
  to?: string;
}
export interface RTCOffer {
  from?: string;
  sdp: string;
  to?: string;
}
