---
layout: single
title: "An alternative approach to HTB hunting"
tags: HTB pwn exploitation flag
category: Pwn
header:
  image: /assets/images/posts/2022-09-01-an-alternative-approach-to-htb-hunting/Teaser.PNG
  caption: "Picture credit: Me"
  teaser: /assets/images/posts/2022-09-01-an-alternative-approach-to-htb-hunting/Teaser.PNG
---

This is my first writeup of HTB "Hunting" PWN challenge.

<html class="staticrypt-html">
<head>
    <meta charset="utf-8">
    <title>Protected Page</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js"></script>
    <meta http-equiv="cache-control" content="max-age=0"/>
    <meta http-equiv="cache-control" content="no-cache"/>
    <meta http-equiv="expires" content="0"/>
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT"/>
    <meta http-equiv="pragma" content="no-cache"/>

    <style>
        .staticrypt-hr {
            margin-top: 20px;
            margin-bottom: 20px;
            border: 0;
            border-top: 1px solid #eee;
        }

        .staticrypt-page {
            width: 360px;
            padding: 8% 0 0;
            margin: auto;
            box-sizing: border-box;
        }

        .staticrypt-form {
            position: relative;
            z-index: 1;
            background: #FFFFFF;
            max-width: 360px;
            margin: 0 auto 100px;
            padding: 45px;
            text-align: center;
            box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
        }

        .staticrypt-form input[type="password"] {
            outline: 0;
            background: #f2f2f2;
            width: 100%;
            border: 0;
            margin: 0 0 15px;
            padding: 15px;
            box-sizing: border-box;
            font-size: 14px;
        }

        .staticrypt-form .staticrypt-decrypt-button {
            text-transform: uppercase;
            outline: 0;
            background: #4CAF50;
            width: 100%;
            border: 0;
            padding: 15px;
            color: #FFFFFF;
            font-size: 14px;
            cursor: pointer;
        }

        .staticrypt-form .staticrypt-decrypt-button:hover, .staticrypt-form .staticrypt-decrypt-button:active, .staticrypt-form .staticrypt-decrypt-button:focus {
            background: #43A047;
        }

        .staticrypt-html {
            height: 100%;
        }

        .staticrypt-body {
            margin-bottom: 1em;
            background: #76b852; /* fallback for old browsers */
            background: -webkit-linear-gradient(right, #76b852, #8DC26F);
            background: -moz-linear-gradient(right, #76b852, #8DC26F);
            background: -o-linear-gradient(right, #76b852, #8DC26F);
            background: linear-gradient(to left, #76b852, #8DC26F);
            font-family: "Arial", sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .staticrypt-instructions {
            margin-top: -1em;
            margin-bottom: 1em;
        }

        .staticrypt-title {
            font-size: 1.5em;
        }

        .staticrypt-footer {
            position: fixed;
            height: 20px;
            font-size: 16px;
            padding: 2px;
            bottom: 0;
            left: 0;
            right: 0;
            margin-bottom: 0;
        }

        .staticrypt-footer p {
            margin: 2px;
            text-align: center;
            float: right;
        }

        .staticrypt-footer a {
            text-decoration: none;
        }

        label.staticrypt-remember {
            display: flex;
            align-items: center;
            margin-bottom: 1em;
        }

        .staticrypt-remember input[type=checkbox] {
            transform: scale(1.5);
            margin-right: 1em;
        }

        .hidden {
            display: none !important;
        }
    </style>
</head>

<body class="staticrypt-body">
<div class="staticrypt-page">
    <div class="staticrypt-form">
        <div class="staticrypt-instructions">
            <p class="staticrypt-title">Protected Page</p>
            <p></p>
        </div>

        <hr class="staticrypt-hr">

        <form id="staticrypt-form" action="#" method="post">
            <input id="staticrypt-password"
                   type="password"
                   name="password"
                   placeholder="Passphrase"
                   autofocus/>

            <label id="staticrypt-remember-label" class="staticrypt-remember hidden">
                <input id="staticrypt-remember"
                       type="checkbox"
                       name="remember"/>
                Remember me
            </label>

            <input type="submit" class="staticrypt-decrypt-button" value="DECRYPT"/>
        </form>
    </div>

</div>
<footer class="staticrypt-footer">
    <p class="pull-right">Created with <a href="https://robinmoisson.github.io/staticrypt">StatiCrypt</a></p>
</footer>


<script src="/assets/js/kript/kryptojs-3.1.9-1-lib.js"></script>

<script>
    // variables to be filled when generating the file
    var encryptedMsg = '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',
        salt = '5660afdd67269e686cd3505c3488f9fa',
        isRememberEnabled = true,
        rememberDurationInDays = 0; // 0 means forever

    // constants
    var rememberPassphraseKey = 'staticrypt_passphrase',
        rememberExpirationKey = 'staticrypt_expiration';

    /**
     * Decrypt a salted msg using a password.
     * Inspired by https://github.com/adonespitogo
     *
     * @param  encryptedMsg
     * @param  hashedPassphrase
     * @returns 
     */
    function decryptMsg(encryptedMsg, hashedPassphrase) {
        var iv = CryptoJS.enc.Hex.parse(encryptedMsg.substr(0, 32))
        var encrypted = encryptedMsg.substring(32);

        return CryptoJS.AES.decrypt(encrypted, hashedPassphrase, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        }).toString(CryptoJS.enc.Utf8);
    }

    /**
     * Decrypt our encrypted page, replace the whole HTML.
     *
     * @param  hashedPassphrase
     * @returns 
     */
    function decryptAndReplaceHtml(hashedPassphrase) {
        var encryptedHMAC = encryptedMsg.substring(0, 64),
            encryptedHTML = encryptedMsg.substring(64),
            decryptedHMAC = CryptoJS.HmacSHA256(encryptedHTML, CryptoJS.SHA256(hashedPassphrase).toString()).toString();

        if (decryptedHMAC !== encryptedHMAC) {
            return false;
        }

        var md = decryptMsg(encryptedHTML, hashedPassphrase);

        showdown.setFlavor('github');

        var converter = new showdown.Converter({
            openLinksInNewWindow: 1,

            });
        var text      = md,
            html      = converter.makeHtml(text);

        document.querySelector(".staticrypt-page").innerHTML = html;
        document.querySelector(".staticrypt-page").className = "";

        return true;
    }

    /**
     * Salt and hash the passphrase so it can be stored in localStorage without opening a password reuse vulnerability.
     *
     * @param  passphrase
     * @returns 
     */
    function hashPassphrase(passphrase) {
        return CryptoJS.PBKDF2(passphrase, salt, {
            keySize: 256 / 32,
            iterations: 1000
        }).toString();
    }

    /**
     * Clear localstorage from staticrypt related values
     */
    function clearLocalStorage() {
        localStorage.removeItem(rememberPassphraseKey);
        localStorage.removeItem(rememberExpirationKey);
    }

    // try to automatically decrypt on load if there is a saved password
    window.onload = function () {
        if (isRememberEnabled) {
            // show the remember me checkbox
            document.getElementById('staticrypt-remember-label').classList.remove('hidden');

            // if we are login out, clear the storage and terminate
            var queryParams = new URLSearchParams(window.location.search);

            if (queryParams.has("staticrypt_logout")) {
                return clearLocalStorage();
            }

            // if there is expiration configured, check if we're not beyond the expiration
            if (rememberDurationInDays && rememberDurationInDays > 0) {
                var expiration = localStorage.getItem(rememberExpirationKey),
                    isExpired = expiration && new Date().getTime() > parseInt(expiration);

                if (isExpired) {
                    return clearLocalStorage();
                }
            }

            var hashedPassphrase = localStorage.getItem(rememberPassphraseKey);

            if (hashedPassphrase) {
                // try to decrypt
                var isDecryptionSuccessful = decryptAndReplaceHtml(hashedPassphrase);

                // if the decryption is unsuccessful the password might be wrong - silently clear the saved data and let
                // the user fill the password form again
                if (!isDecryptionSuccessful) {
                    return clearLocalStorage();
                }
            }
        }
    }

    // handle password form submission
    document.getElementById('staticrypt-form').addEventListener('submit', function (e) {
        e.preventDefault();

        var passphrase = document.getElementById('staticrypt-password').value,
            shouldRememberPassphrase = document.getElementById('staticrypt-remember').checked;

        // decrypt and replace the whole page
        var hashedPassphrase = hashPassphrase(passphrase);
        var isDecryptionSuccessful = decryptAndReplaceHtml(hashedPassphrase);

        if (isDecryptionSuccessful) {
            // remember the hashedPassphrase and set its expiration if necessary
            if (isRememberEnabled && shouldRememberPassphrase) {
                window.localStorage.setItem(rememberPassphraseKey, hashedPassphrase);

                // set the expiration if the duration isn't 0 (meaning no expiration)
                if (rememberDurationInDays > 0) {
                    window.localStorage.setItem(
                        rememberExpirationKey,
                        (new Date().getTime() + rememberDurationInDays * 24 * 60 * 60 * 1000).toString()
                    );
                }
            }
        } else {
            alert('Bad passphrase!');
        }
    });
</script>
</body>
</html>
