

// module.exports.resetPasswordTemplate = (username, resetLink) => {
//     return `
//         <!DOCTYPE html>
//         <html lang="en">

//         <head>
//             <meta charset="UTF-8">
//             <meta http-equiv="X-UA-Compatible" content="IE=edge">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Reset Password</title>
//             <style>
//                 /* Global CSS styles */
//                 body {
//                     margin: 0;
//                     padding: 0;
//                     font-family: Arial, sans-serif;
//                     line-height: 1.6;
//                 }
//                 .container {
//                     margin: 0 auto;
//                     max-width: 600px;
//                     padding: 20px;
//                     background: #f9f9f9;
//                     border: 1px solid #ccc;
//                     border-radius: 5px;
//                     box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//                 }
//                 .header {
//                     background: #4b2179;
//                     color: #fff;
//                     text-align: center;
//                     padding: 10px 0;
//                     border-top-left-radius: 5px;
//                     border-top-right-radius: 5px;
//                 }
//                 .header h1 {
//                     margin: 0;
//                 }
//                 .content {
//                     padding: 20px 0;
//                     text-align: center;
//                 }
//                 .content img {

//                     margin-bottom: 20px;
//                 }
//                 .footer {
//                     background: #4b2179;
//                     color: #fff;
//                     text-align: center;
//                     padding: 10px 0;
//                     border-bottom-left-radius: 5px;
//                     border-bottom-right-radius: 5px;
//                 }
//             </style>
//         </head>
//         <body>
//             <div class="container">
//                 <div class="header">
//                     <h1>Reset Your Password</h1>
//                 </div>
//                 <div class="content">
//                     <h2>Hello, ${username}
//                     </h2>
//                     <p>Here is the link to reset your password: </p>

//                     <button><a href="${resetLink}" style="background: #4b2179; color: #fff; padding: 10px 20px; text-decoration: none;
//                         border-radius: 5px;">Reset Password</a></button>
//                     <!-- <p>
//                         <%= message %>
//                     </p> -->
//                     <p>
//                         If you did not ask to reset your password, you may ignore this message.. 
//                     </p>
//                     <p>

//                     </p>
//                 </div>
//                 <div class="footer">
//                     <p>Footer &copy; 2024</p>
//                 </div>
//             </div>
//         </body>
//         </html>

//     `
// }


module.exports.resetPasswordTemplate = (username, resetLink) => {
    return `
        <!DOCTYPE html>
<html>

<head>
    <title>Reset Password</title>
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
            <a href=${resetLink} class="button">Reset password</a>
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