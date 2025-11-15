import { Router, Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

const router = Router();
const notificationService = new NotificationService();

// 사용자의 모든 알림 조회 (test-api.js 호환)
router.get('/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    const notifications = notificationService.getUserNotifications(address);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    res.json({
      success: true,
      data: notifications,
      unreadCount,  // test-api.js가 기대하는 필드
      count: notifications.length
    });
  } catch (error) {
    next(error);
  }
});

// 사용자의 모든 알림 조회 (레거시 경로)
router.get('/user/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    const notifications = notificationService.getUserNotifications(address);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    res.json({
      success: true,
      data: notifications,
      unreadCount,
      count: notifications.length
    });
  } catch (error) {
    next(error);
  }
});

// 읽지 않은 알림 조회
router.get('/user/:address/unread', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    const notifications = notificationService.getUnreadNotifications(address);
    
    res.json({
      success: true,
      data: notifications,
      unreadCount: notifications.length,
      count: notifications.length
    });
  } catch (error) {
    next(error);
  }
});

// 알림 읽음 처리
router.put('/:notificationId/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notificationId } = req.params;
    
    const notification = notificationService.markAsRead(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
});

// 모든 알림 읽음 처리
router.put('/user/:address/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    const count = notificationService.markAllAsRead(address);
    
    res.json({
      success: true,
      message: `${count} notifications marked as read`,
      count
    });
  } catch (error) {
    next(error);
  }
});

// 알림 삭제
router.delete('/:notificationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notificationId } = req.params;
    
    const success = notificationService.deleteNotification(notificationId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// 사용자의 모든 알림 삭제
router.delete('/user/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    const count = notificationService.deleteAllUserNotifications(address);
    
    res.json({
      success: true,
      message: `${count} notifications deleted`,
      count
    });
  } catch (error) {
    next(error);
  }
});

export default router;
