import { api } from './api';

export const shareService = {
  getServerIp() {
    return api.get('get_ip.php');
  }
};
