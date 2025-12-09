import axios from "axios";
import { BASE_URL } from "./baseUrl";

export const initiatePayment = async (paymentData) => {
    const {
        missionId,
        type = "ACOMPTE",
        mode = "MOBILE_MONEY",
        customerMsisdn,
        otp,
    } = paymentData;

    // Create FormData object - backend expects multipart/form-data
    // Note: montant is NOT sent, backend retrieves it automatically from mission
    const formData = new FormData();
    formData.append("missionId", missionId);
    formData.append("type", type);
    formData.append("mode", mode);
    formData.append("customerMsisdn", customerMsisdn);
    formData.append("otp", otp);

    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${BASE_URL}/paiements/initier`, formData, {
            headers: {
                "Content-Type": "multipart/form-data", // axios sets boundary automatically
                "Authorization": `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Payment Error:", error);

        // Extract user-friendly error message
        let errorMessage = "Erreur lors du paiement";

        if (error.response?.data) {
            let data = error.response.data;

            // If data is a string, try to parse it as JSON
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    // If parsing fails, keep the string as is
                }
            }

            // Check if the message field contains a JSON string
            if (typeof data.message === 'string' && data.message.includes('{')) {
                try {
                    const parsedMessage = JSON.parse(data.message.split(': "')[1]?.replace(/"$/, ''));
                    if (parsedMessage?.error_details?.data?.ERRORUSERMSG) {
                        errorMessage = parsedMessage.error_details.data.ERRORUSERMSG;
                    } else if (parsedMessage?.message) {
                        errorMessage = parsedMessage.message;
                    }
                } catch (e) {
                    // If parsing the embedded JSON fails, try other methods
                    if (data.error_details?.data?.ERRORUSERMSG) {
                        errorMessage = data.error_details.data.ERRORUSERMSG;
                    } else if (data.error_details?.message) {
                        errorMessage = data.error_details.message;
                    } else if (data.message) {
                        errorMessage = data.message;
                    }
                }
            } else {
                // Try to extract the most user-friendly message
                if (data.error_details?.data?.ERRORUSERMSG) {
                    errorMessage = data.error_details.data.ERRORUSERMSG;
                } else if (data.error_details?.message) {
                    errorMessage = data.error_details.message;
                } else if (data.message) {
                    errorMessage = data.message;
                }
            }

            // Simplify long messages - extract only the first meaningful line
            if (errorMessage.includes(':')) {
                // Extract the part before the first colon or newline
                const firstPart = errorMessage.split(/[:|\n]/)[0].trim();
                if (firstPart.length > 10) {
                    errorMessage = firstPart;
                }
            }

            // If message contains "OTP", simplify it
            if (errorMessage.toLowerCase().includes('otp')) {
                if (errorMessage.toLowerCase().includes('invalide') || errorMessage.toLowerCase().includes('incorrect')) {
                    errorMessage = "Code OTP invalide";
                } else if (errorMessage.toLowerCase().includes('existe pas') || errorMessage.toLowerCase().includes('not present')) {
                    errorMessage = "Code OTP incorrect";
                } else if (errorMessage.toLowerCase().includes('expiré') || errorMessage.toLowerCase().includes('expired')) {
                    errorMessage = "Code OTP expiré";
                }
            }
        } else if (error.request) {
            errorMessage = "Aucune réponse du serveur de paiement";
        } else {
            errorMessage = "Erreur lors de l'initialisation du paiement";
        }

        throw new Error(errorMessage);
    }
};
