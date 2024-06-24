module.exports.otpTemplate = (username, providedOTP) => {
    providedOTP = providedOTP.toString();
    const otpChars = providedOTP.split('');
    const otpFields = otpChars.map(char => `<input type="text" class="otp" maxlength="1" readonly value="${char}">`).join('');

    return `
        <!DOCTYPE html>
<html>

<head>
    <title>OTP Verification</title>
    <style type="text/css">
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 50%;
            padding: 20px;
            margin: 0 auto;
            background-color: #0B1926;
            color: #FFFFFF;
        }

        .header {
            text-align: center;
            padding: 10px 0;
        }

        .header img {
            width: 150px;
        }

        .main-content {
            padding: 20px;
            border-radius: 8px;
        }

        .main-content img {
            width: 100%;
        }

        .best p {
            display: inline;
        }

        .button {
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 10px 0;
            text-align: center;
            background-color: #5CFF85;
            color: #0B1926;
            border-radius: 20px;
            text-decoration: none;
            font-weight: 600;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
            color: rgb(184, 183, 183);
        }

        .footer p {
            font-size: 11px;
            text-align: center;
        }

        .footer a {
            color: white;
            text-decoration: none;
            text-align: center;
            position: relative;
            padding-left: 15px;
            padding-right: 2px;
            text-decoration: underline;
            font-size: 12px;
        }

        .footer a.change::before {
            content: '•';
            color: white;
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            font-size: 20px;
        }

        .line {
            height: 2px;
            margin-top: 20px;
            margin-inline: 20px;
            margin-bottom: -10px;
            background: rgb(184, 183, 183);
        }

        #team {
            color: #5CFF85;
        }

        .otp-box {
            display: flex;
            margin: 20px 110px;
        }

        .otp {
        margin: 0 10px;
            background-color: #1A2A3A;
            border: none;
            border-radius: 8px;
            width: 50px;
            height: 50px;
            text-align: center;
            font-size: 24px;
            color: #FFFFFF;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <img src="https://imgur.com/PmEtyYY.png" />
        </div>
        <div class="main-content">
            <img src="https://imgur.com/OiRAg2Z.png" alt="Banner">
            <h1>Hi ${username},</h1>
            <p>Here is your One Time Password (OTP).<br>Please enter this code to verify your email address for Logo Design Maker</p>
            <div class="otp-box" style="display: flex; justify-content: center;">
               ${otpFields}
            </div>
            <p>OTP will expire in <strong>5 minutes</strong>.</p>
            <div class="best">
                <p>Best Regards,</p>
                <br>
                <p id="team">Logo Design Maker team.</p>
            </div>
        </div>
        <div class="line"></div>
        <div class="footer">
            <p>&copy; 2024 Logo Design Maker. All rights reserved.</p>
            <p>You are receiving this mail because you registered to join the Logo Design Maker platform as a user.<br>This also shows that you agree to our Terms of use and Privacy Policies. If you no longer want to receive mails from us, click the unsubscribe link below to unsubscribe.</p>
            <p><a href="https://yourwebsite.com/unsubscribe">Privacy policy</a>
                <a href="https://yourwebsite.com/unsubscribe" class="change">Terms of service</a>
                <a href="https://yourwebsite.com/unsubscribe" class="change">Help center</a>
                <a href="https://yourwebsite.com/unsubscribe" class="change">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>

</html>

    `
}