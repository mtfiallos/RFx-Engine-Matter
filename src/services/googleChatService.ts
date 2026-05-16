export async function sendGoogleChatNotification(webhookUrl: string, title: string, message: string) {
  if (!webhookUrl) return false;

  const payload = {
    cardsV2: [
      {
        cardId: "rfx-notification",
        card: {
          header: {
            title: "Elyria RFx Engine",
            subtitle: title,
            imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/robot_2/default/24px.svg"
          },
          sections: [
            {
              header: "Update Details",
              widgets: [
                {
                  textParagraph: {
                    text: message
                  }
                }
              ]
            }
          ]
        }
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send Google Chat notification:", error);
    return false;
  }
}
