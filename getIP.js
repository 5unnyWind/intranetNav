function getIP(callback) {
    let recode = {};
    let RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    // 如果不存在则使用一个iframe绕过
    if (!RTCPeerConnection) {
        // 因为这里用到了iframe，所以在调用这个方法的script上必须有一个iframe标签
        // <iframe id="iframe" sandbox="allow-same-origin"></iframe>
        let win = iframe.contentWindow;
        RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection || win.webkitRTCPeerConnection;
    }

    //创建实例，生成连接
    let pc = new RTCPeerConnection();

    // 匹配字符串中符合ip地址的字段
    function handleCandidate(candidate) {
        let ip_regexp = /([0-9]{1,3}(\.[0-9]{1,3}){3}|([a-f0-9]{1,4}((:[a-f0-9]{1,4}){7}|:+[a-f0-9]{1,4}){6}))/;
        let ip_isMatch = candidate.match(ip_regexp)[1];
        if (!recode[ip_isMatch]) {
            callback(ip_isMatch);
            recode[ip_isMatch] = true;
        }
    }

    //监听icecandidate事件
    pc.onicecandidate = (ice) => {
        if (ice.candidate) {
            handleCandidate(ice.candidate.candidate);
        }
    };
    //建立一个伪数据的通道
    pc.createDataChannel('');
    pc.createOffer((res) => {
        pc.setLocalDescription(res);
    }, () => {});

    //延迟，让一切都能完成
    setTimeout(() => {
        let lines = pc.localDescription.sdp.split('\n');
        lines.forEach(item => {
            if (item.indexOf('a=candidate:') === 0) {
                handleCandidate(item);
            }
        })
    }, 1000);
}