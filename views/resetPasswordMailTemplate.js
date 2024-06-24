
module.exports.resetPasswordTemplate = (username, resetLink) => {
    return `
        <!DOCTYPE html>
<html>

<head>
    <title>Reset Password</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
    <style type="text/css">
        body {
            font-family: "Inter", sans-serif;
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
            border-bottom: white;
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
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <img src="https://imgur.com/PmEtyYY.png" />
        </div>
        <div class="main-content">
            <img src="https://imgur.com/OiRAg2Z.png" alt="Banner">
            <h2>Hi ${username},</h2>
            <p>You have requested us to send a link to reset your password for your Logo Design Maker account, click on the button below.</p>
            <a style="color: #0B1926;" href=${resetLink} class="button">Reset password</a>
            <p>If you didn't initiate the request, you can safely ignore the mail.</p>
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