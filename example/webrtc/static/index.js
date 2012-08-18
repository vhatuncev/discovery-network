var WebRTC = require("webrtc-stream")
    , MediaStream = WebRTC.MediaStream
    , SimplePeerConnections = WebRTC.SimplePeerConnections
    , webrtcLog = WebRTC.log
    , DiscoveryNetwork = require("../../../browser")
    , discoveryLog = DiscoveryNetwork.log
    , Connection = DiscoveryNetwork.Connection
    , PeerNetwork = DiscoveryNetwork.PeerNetwork
    , WebRTCNetwork = DiscoveryNetwork.WebRTCNetwork

var localVideo = document.getElementById("local-webrtc")
    , remoteVideos = document.getElementById("remote-videos")

MediaStream.local(localVideo, function (myMediaStream) {
    var conn = Connection("http://localhost:8081/shoe")
        , pcs = SimplePeerConnections(myMediaStream)

    webrtcLog.enabled = true
    discoveryLog.enabled = true

    webrtcLog.info("networkConnection", conn, pcs)

    conn.identify()

    var peerNetwork = PeerNetwork(conn, "discovery-network-demo:peer")
        , webrtcNetwork = WebRTCNetwork(conn, "discovery-network-demo:webrtc")

    // when you detect a new peer joining, open a PC to them
    peerNetwork.on("peer", handlePeer)

    // incoming offer from another peer
    webrtcNetwork.on("offer", handleOffer)

    // incoming answers from another peer
    webrtcNetwork.on("answer", pcs.handleAnswer)

    // incoming candidates from another peer
    webrtcNetwork.on("candidate", pcs.handleCandidate)

    // outgoing candidates to another peer
    pcs.on("candidate", webrtcNetwork.sendCandidate)

    // render streams from pcs
    pcs.on("stream", renderStream)

    peerNetwork.join()

    function handlePeer(remotePeerId) {
        webrtcLog.info("handlePeer", remotePeerId)
        var offer = pcs.create(remotePeerId)

        webrtcNetwork.sendOffer(remotePeerId, offer)
    }

    function handleOffer(remotePeerId, offer) {
        webrtcLog.info("handleOffer", arguments)
        var answer = pcs.create(remotePeerId, offer)

        webrtcNetwork.sendAnswer(remotePeerId, answer)
    }

    function renderStream(remotePeerId, stream) {
        webrtcLog.info("onRemoteStream", stream)
        var remoteVideo = document.createElement("video")
        remoteVideo.autoplay = true
        remoteVideos.appendChild(remoteVideo)
        MediaStream.remote(remoteVideo, stream)
    }
})