import { UserProfile } from '../types';

// 메모리 기반 저장소
const profiles = new Map<string, UserProfile>();

export class ProfileService {
  
  // 프로필 조회
  getProfile(address: string, role: 'tenant' | 'landlord'): UserProfile | null {
    const key = `${address.toLowerCase()}-${role}`;
    return profiles.get(key) || null;
  }
  
  // 프로필 생성
  createProfile(data: Partial<UserProfile> & { address: string; role: 'tenant' | 'landlord' }): UserProfile {
    const key = `${data.address.toLowerCase()}-${data.role}`;
    
    const profile: UserProfile = {
      address: data.address.toLowerCase(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      verified: data.verified || false,
      profileImage: data.profileImage,
      settings: data.settings,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    profiles.set(key, profile);
    return profile;
  }
  
  // 프로필 업데이트
  updateProfile(
    address: string, 
    role: 'tenant' | 'landlord',
    updates: Partial<Pick<UserProfile, 'name' | 'email' | 'phone' | 'profileImage' | 'settings'>>
  ): UserProfile | null {
    const key = `${address.toLowerCase()}-${role}`;
    const profile = profiles.get(key);
    
    if (!profile) {
      return null;
    }
    
    const updatedProfile: UserProfile = {
      ...profile,
      ...updates,
      updatedAt: Date.now()
    };
    
    profiles.set(key, updatedProfile);
    return updatedProfile;
  }
  
  // 검증 상태 업데이트 (landlord만 해당)
  updateVerification(address: string, verified: boolean): UserProfile | null {
    const key = `${address.toLowerCase()}-landlord`;
    const profile = profiles.get(key);
    
    if (!profile) {
      return null;
    }
    
    profile.verified = verified;
    profile.updatedAt = Date.now();
    profiles.set(key, profile);
    
    return profile;
  }
  
  // 모든 프로필 조회 (역할별)
  getProfilesByRole(role: 'tenant' | 'landlord'): UserProfile[] {
    const result: UserProfile[] = [];
    profiles.forEach((profile) => {
      if (profile.role === role) {
        result.push(profile);
      }
    });
    return result;
  }
  
  // 프로필 삭제
  deleteProfile(address: string, role: 'tenant' | 'landlord'): boolean {
    const key = `${address.toLowerCase()}-${role}`;
    return profiles.delete(key);
  }
}
