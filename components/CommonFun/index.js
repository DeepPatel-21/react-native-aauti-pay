const {getApiDataProgressPayment} = require('components/APIHelper');

async function getAccessToken() {
  const data = {
    grant_type: 'client_credentials',
    client_id: '6590d4cc-f17f-4495-9f8c-c310de9fa799',
    client_secret: '-Wz8Q~P7J1g5WTXE3jdkDrWPGe.wvpsoFGNJ-a4D',
    scope: 'api://bloom-backend-app-dev/.default',
  };

  try {
    const response = await getApiDataProgressPayment(
      'https://login.microsoftonline.com/211df5dc-16ac-4ca1-86af-315cf7507335/oauth2/v2.0/token',
      'POST',
      data,
    );
    if (response?.status == false) {
      Alert.alert(
        'Error',
        response?.message || 'Please try again. Something got wrong.',
      );
    } else {
    }
  } catch (error) {
    console.log('error:', error);
  }
}
