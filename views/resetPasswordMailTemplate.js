
module.exports.resetPasswordTemplate = (username, resetLink) => {
    return `
        <!DOCTYPE html>
<html lang="en">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Reset Password</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
    <style media="all" type="text/css">
        @media only screen and (max-width: 640px) {
            .container {
                width: 100% !important;
                padding: 10px !important;
            }

            .main-content {
                padding: 10px !important;
            }

            h1 {
                font-size: 18px !important;
            }

            p {
                font-size: 12px !important;
            }

            #button {
                padding: 5px 0  !important;
                font-size: 12px  !important;
                width: 150px  !important;
            }

            .best p,
            #team {
                font-size: 12px !important;
            }

            .footer p {
                font-size: 9px !important;
            }

            .footer a {
                font-size: 9px !important;
                padding-left: 10px !important;
                padding-right: 1px !important;
            }

            .footer a.change::before {
                font-size: 15px !important;
            }
        }
    </style>
</head>

<body style="font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #f4f5f6;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="width: 100%; background-color: #f4f5f6;">
        <tr>
            <td style="font-family: 'Inter', sans-serif; font-size: 16px; vertical-align: top;" valign="top">&nbsp;</td>
            <td class="container" style="font-family: 'Inter', sans-serif; font-size: 16px; vertical-align: top; max-width: 600px; width: 600px; margin: 0 auto; padding: 20px; background-color: #0B1926; color: #FFFFFF;" width="600" valign="top">
                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 600px; padding: 0;">
                    <div class="header" style="text-align: center; padding: 10px 0;">
                        <img src="https://imgur.com/PmEtyYY.png" style="width: 150px;" />
                    </div>
                    <div class="main-content" style="padding: 20px; border-radius: 8px;">
                        <img src="https://imgur.com/OiRAg2Z.png" alt="Banner" style="width: 100%;">
                        <h1 style="font-size: 24px; color: #FFFFFF;">Hi ${username},</h1>
                        <p style="font-size: 16px; color: #FFFFFF;">You have requested us to send a link to reset your password for your Logo Design Maker account. Click on the button below.</p>
                        <a id="button" href=${resetLink} style="display: block; width: 200px; margin: 20px auto; padding: 10px 0; text-align: center; background-color: #5CFF85; color: #0B1926; border-radius: 20px; text-decoration: none; font-weight: 600;">Reset password</a>
                        <p style="font-size: 16px; color: #FFFFFF;">If you didn't initiate the request, you can safely ignore this email.</p>
                        <div class="best" style="font-size: 16px;">
                            <p style="display: inline; color: #FFFFFF;">Best Regards,</p>
                            <br>
                            <p id="team" style="color: #5CFF85;">Logo Design Maker team.</p>
                        </div>
                    </div>
                    <div class="line" style="height: 2px; margin-top: 20px; margin-inline: 10px; margin-bottom: -10px; background: rgb(184, 183, 183);"></div>
                    <div class="footer" style="text-align: center; margin-top: 20px; color: rgb(184, 183, 183);">
                        <p style="font-size: 11px; color: rgb(184, 183, 183);">&copy; 2024 Logo Design Maker. All rights reserved.</p>
                        <p style="font-size: 11px; color: rgb(184, 183, 183);">You are receiving this mail because you registered to join the Logo Design Maker platform as a user.<br>This also shows that you agree to our Terms of use and Privacy Policies. If you no longer want to receive mails from us, click the unsubscribe link below to unsubscribe.</p>
                        <p style="font-size: 12px;">
                            <a href="https://yourwebsite.com/unsubscribe" style="color: white; text-decoration: none; text-align: center; position: relative; padding-left: 15px; padding-right: 2px; text-decoration: underline;">Privacy policy</a>
                            <a href="https://yourwebsite.com/unsubscribe" class="change" style="color: white; text-decoration: none; text-align: center; position: relative; padding-left: 15px; padding-right: 2px; text-decoration: underline;">Terms of service</a>
                            <a href="https://yourwebsite.com/unsubscribe" class="change" style="color: white; text-decoration: none; text-align: center; position: relative; padding-left: 15px; padding-right: 2px; text-decoration: underline;">Help center</a>
                            <a href="https://yourwebsite.com/unsubscribe" class="change" style="color: white; text-decoration: none; text-align: center; position: relative; padding-left: 15px; padding-right: 2px; text-decoration: underline;">Unsubscribe</a>
                        </p>
                    </div>
                </div>
            </td>
            <td style="font-family: 'Inter', sans-serif; font-size: 16px; vertical-align: top;" valign="top">&nbsp;</td>
        </tr>
    </table>
</body>
</html>
    `
}