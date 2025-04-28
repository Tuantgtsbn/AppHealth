import NetInfo from '@react-native-community/netinfo';

/**
 * Kiểm tra kết nối mạng hiện tại
 * @returns Promise<boolean> - true nếu có kết nối mạng, false nếu không
 */
export const checkNetworkConnection = async (): Promise<boolean> => {
    try {
        const state = await NetInfo.fetch();
        return state.isConnected && state.isInternetReachable;
    } catch (error) {
        console.error('Lỗi khi kiểm tra kết nối mạng:', error);
        return false;
    }
};

/**
 * Đăng ký lắng nghe sự thay đổi kết nối mạng
 * @param callback Hàm callback được gọi khi trạng thái mạng thay đổi
 * @returns Hàm hủy đăng ký lắng nghe
 */
export const subscribeToNetworkChanges = (
    callback: (isConnected: boolean) => void
): (() => void) => {
    return NetInfo.addEventListener((state) => {
        const isConnected = state.isConnected && state.isInternetReachable;
        callback(isConnected);
    });
};
