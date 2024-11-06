/* global OT SAMPLE_SERVER_BASE_URL */

let applicationId;
let sessionId;
let token;

function handleError(error) {
  if (error) {
    console.error('Vonage Video API Error:', error.message);
  }
}

function initializeSession() {
  const session = OT.initSession(applicationId, sessionId);

  // 订阅新创建的流
  session.on('streamCreated', (event) => {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    };
    session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
  });

  session.on('sessionDisconnected', (event) => {
    console.log('你已断开会话连接:', event.reason);
  });

  // 初始化发布者
  const publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%',
    resolution: '1280x720'
  };
  const publisher = OT.initPublisher('publisher', publisherOptions, handleError);

  // 连接到会话
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      session.publish(publisher, handleError);
    }
  });
}

// 获取 Vonage Video API 凭据并初始化会话
fetch(`${SAMPLE_SERVER_BASE_URL}/session`)
  .then(response => response.json())
  .then(json => {
    applicationId = json.applicationId;
    sessionId = json.sessionId;
    token = json.token;
    initializeSession(); // 获取到凭据后初始化会话
  })
  .catch(error => {
    handleError(error);
    alert('无法获取会话信息，请确保 VCR 服务器已部署并正确配置。');
  });
