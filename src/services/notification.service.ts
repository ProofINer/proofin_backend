import { Notification, NotificationType } from '../types';

// 메모리 기반 저장소
const notifications = new Map<string, Notification>();
const userNotifications = new Map<string, string[]>(); // userId -> notificationIds[]

// 간단한 UUID 생성 함수
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export class NotificationService {
  
  // 알림 생성
  createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ): Notification {
    const notification: Notification = {
      id: generateId(),
      userId: userId.toLowerCase(),
      type,
      title,
      message,
      data,
      read: false,
      createdAt: Date.now()
    };
    
    notifications.set(notification.id, notification);
    
    // 사용자별 알림 ID 목록에 추가
    const userNotifs = userNotifications.get(notification.userId) || [];
    userNotifs.push(notification.id);
    userNotifications.set(notification.userId, userNotifs);
    
    return notification;
  }
  
  // 사용자의 모든 알림 조회
  getUserNotifications(userId: string): Notification[] {
    const normalizedUserId = userId.toLowerCase();
    const notifIds = userNotifications.get(normalizedUserId) || [];
    
    const notifs = notifIds
      .map(id => notifications.get(id))
      .filter((n): n is Notification => n !== undefined);
    
    return notifs.sort((a, b) => b.createdAt - a.createdAt); // 최신순
  }
  
  // 읽지 않은 알림 조회
  getUnreadNotifications(userId: string): Notification[] {
    return this.getUserNotifications(userId).filter(n => !n.read);
  }
  
  // 알림 읽음 처리
  markAsRead(notificationId: string): Notification | null {
    const notification = notifications.get(notificationId);
    if (!notification) {
      return null;
    }
    
    notification.read = true;
    notifications.set(notificationId, notification);
    return notification;
  }
  
  // 모든 알림 읽음 처리
  markAllAsRead(userId: string): number {
    const normalizedUserId = userId.toLowerCase();
    const userNotifs = this.getUserNotifications(normalizedUserId);
    
    let count = 0;
    userNotifs.forEach(notif => {
      if (!notif.read) {
        notif.read = true;
        notifications.set(notif.id, notif);
        count++;
      }
    });
    
    return count;
  }
  
  // 알림 삭제
  deleteNotification(notificationId: string): boolean {
    const notification = notifications.get(notificationId);
    if (!notification) {
      return false;
    }
    
    // 사용자 목록에서도 제거
    const userNotifs = userNotifications.get(notification.userId) || [];
    const filteredNotifs = userNotifs.filter(id => id !== notificationId);
    userNotifications.set(notification.userId, filteredNotifs);
    
    return notifications.delete(notificationId);
  }
  
  // 특정 사용자의 모든 알림 삭제
  deleteAllUserNotifications(userId: string): number {
    const normalizedUserId = userId.toLowerCase();
    const notifIds = userNotifications.get(normalizedUserId) || [];
    
    let count = 0;
    notifIds.forEach(id => {
      if (notifications.delete(id)) {
        count++;
      }
    });
    
    userNotifications.delete(normalizedUserId);
    return count;
  }
  
  // 계약 생성 알림
  notifyContractCreated(landlordAddress: string, contractId: number, tenantAddress: string) {
    return this.createNotification(
      landlordAddress,
      NotificationType.CONTRACT_CREATED,
      '새로운 계약 요청',
      `세입자 ${tenantAddress}가 계약을 요청했습니다.`,
      { contractId, tenantAddress }
    );
  }
  
  // 계약 검증 완료 알림
  notifyContractVerified(tenantAddress: string, contractId: number) {
    return this.createNotification(
      tenantAddress,
      NotificationType.CONTRACT_VERIFIED,
      '계약이 승인되었습니다',
      `집주인이 계약을 승인했습니다. NFT가 발행됩니다.`,
      { contractId }
    );
  }
  
  // NFT 발행 알림
  notifyNFTMinted(tenantAddress: string, tokenId: number, contractId: number) {
    return this.createNotification(
      tenantAddress,
      NotificationType.NFT_MINTED,
      'NFT가 발행되었습니다',
      `계약서 NFT(토큰 ID: ${tokenId})가 발행되었습니다.`,
      { tokenId, contractId }
    );
  }
  
  // 보증금 입금 알림
  notifyDepositReceived(landlordAddress: string, contractId: number, amount: string) {
    return this.createNotification(
      landlordAddress,
      NotificationType.DEPOSIT_RECEIVED,
      '보증금이 입금되었습니다',
      `${amount} ETH의 보증금이 입금되었습니다.`,
      { contractId, amount }
    );
  }
  
  // 계약 완료 알림
  notifyContractCompleted(addresses: string[], contractId: number) {
    const notifications: Notification[] = [];
    addresses.forEach(address => {
      const notif = this.createNotification(
        address,
        NotificationType.CONTRACT_COMPLETED,
        '계약이 완료되었습니다',
        `계약 ${contractId}번이 완료되었습니다.`,
        { contractId }
      );
      notifications.push(notif);
    });
    return notifications;
  }
}
