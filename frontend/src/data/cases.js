// Case files with plain, easy-to-understand language and clear explanations
export const cases = [
  {
    id: 'phishing',
    caseNumber: 'CASE 1',
    codename: 'CHALLENGE 1: FAKE EMAILS',
    title: 'Fake Emails',
    story: "Scammers are sending fake emails to trick people into giving away passwords. A suspicious message just arrived in your inbox.",
    color: 'coral',
    icon: '✉',
    scenarios: [
      {
        id: 'p1',
        type: 'email',
        difficulty: 'LEVEL 1 · URGENT WARNING',
        subject: 'URGENT: Your account will be locked within 24 hours',
        senderName: 'Security Support',
        senderEmail: 'security-alert@micros0ft-verif.net',
        recipient: 'to: you@vault.net',
        destinationUrl: 'https://micros0ft-verif.net/login/auth-session',
        bodyText: 'Dear Customer,\n\nWe detected unauthorized access to your account. Log in within 24 hours or your account will be suspended permanently.',
        actionBtnText: 'LOG IN TO YOUR ACCOUNT',
        correctAction: 'block', // 'block' (fake/dangerous) or 'trust' (safe/real)
        points: 100,
        suspectArea: 'domain',
        signal: 'Look at the sender address: it uses a zero instead of the letter "o" in "micros0ft", and creates artificial panic to rush you.',
        companionReaction: {
          correct: "Great catch! They used a zero in 'micros0ft'. Scammers love to rush you so you don't notice small spelling tricks.",
          wrong: "Oops! Notice how 'micros0ft' is spelled with a zero? Real companies won't threaten to shut down your account in 24 hours like that."
        }
      },
      {
        id: 'p2',
        type: 'email',
        difficulty: 'LEVEL 2 · NORMAL MESSAGE',
        subject: 'Updated team lunch agenda (no action needed)',
        senderName: 'Maya Lin',
        senderEmail: 'maya.lin@northstar-corp.com',
        recipient: 'to: team@northstar-corp.com',
        destinationUrl: null,
        bodyText: "Hey team,\n\nI finalized the agenda for Thursday's workshop. We kick off at 10:00 AM in Room B. Catered lunch will be provided.\n\nNo preparation needed. See you all then!\n\n— Maya",
        actionBtnText: null,
        correctAction: 'trust',
        points: 100,
        suspectArea: 'none',
        signal: 'This is a normal email: legitimate sender address, no strange links, no requests for your password, and no threats.',
        companionReaction: {
          correct: "Good call! Not every email is a trick. Maya is just inviting the team to lunch.",
          wrong: "Wait, you blocked Maya's lunch invite?! It was completely safe! Now Maya thinks you don't like catered lunch."
        }
      },
      {
        id: 'p3',
        type: 'email',
        difficulty: 'LEVEL 3 · SNEAKY FAKE LINK',
        subject: 'Overdue Invoice #88419-B',
        senderName: 'Billing Department',
        senderEmail: 'billing@northstar-corp.co',
        recipient: 'to: finance@northstar-corp.com',
        destinationUrl: 'https://northstar-corp.co.portal-invoicing.com/pay/88419',
        bodyText: "Hello,\n\nPlease find the updated payment breakdown for last month. Late fees apply after 5:00 PM today.",
        actionBtnText: 'VIEW INVOICE DOCUMENT',
        correctAction: 'block',
        points: 150,
        suspectArea: 'url',
        signal: 'Tricky link! The actual website address right before the slash is "portal-invoicing.com", not the official company website.',
        companionReaction: {
          correct: "Brilliant spotting! The link looked real at first glance, but it actually led to an untrusted payment website.",
          wrong: "Careful! When you hover over the link, you can see it actually goes to 'portal-invoicing.com', an impostor website."
        }
      }
    ]
  },
  {
    id: 'passwords',
    caseNumber: 'CASE 2',
    codename: 'CHALLENGE 2: WEAK PASSWORDS',
    title: 'Password Safety',
    story: "Test your password instincts! Decide which passwords are easy for scammers to guess versus which ones are strong and safe.",
    color: 'lime',
    icon: '✦',
    scenarios: [
      {
        id: 'pass1',
        type: 'password',
        difficulty: 'LEVEL 1 · COMMON PHRASE',
        label: 'Password to Check:',
        value: 'Autumn2024!',
        entropy: 32,
        crackTime: '3.4 seconds (using common password lists)',
        correctAction: 'block',
        points: 100,
        signal: 'Combining a season, the current year, and an exclamation mark is one of the most common patterns scammers check first.',
        companionReaction: {
          correct: "Exactly! Season + Year + Symbol is a very common habit. Automated guessing tools try these first.",
          wrong: "Cracked in 3 seconds! Even with a capital letter and an exclamation mark, predictable words are guessed very quickly."
        }
      },
      {
        id: 'pass2',
        type: 'password',
        difficulty: 'LEVEL 2 · KEYBOARD PATTERN',
        label: 'Password to Check:',
        value: 'qwerty!@#123',
        entropy: 26,
        crackTime: 'Instantly (less than 1 second)',
        correctAction: 'block',
        points: 100,
        signal: 'Keys right next to each other on the keyboard ("qwerty", "!@#", "123") are guessed almost instantly by cracking tools.',
        companionReaction: {
          correct: "Spot on! That's just running fingers across the keyboard rows. Password tools test that immediately.",
          wrong: "Ouch. Walking across keyboard keys ('qwerty', '123') is one of the first patterns cracking tools test."
        }
      },
      {
        id: 'pass3',
        type: 'password',
        difficulty: 'LEVEL 3 · LONG & RANDOM PHRASE',
        label: 'Password to Check:',
        value: 'cobalt-velvet#orbit94-falcon',
        entropy: 98,
        crackTime: 'Over 1,000 years',
        correctAction: 'trust',
        points: 150,
        signal: 'Long passwords made of several unrelated words with numbers and symbols are easy to remember and extremely hard to crack.',
        companionReaction: {
          correct: "Super strong! Length is what truly keeps passwords safe. Several random words together are almost impossible to guess.",
          wrong: "Hey, that was actually a very safe password! It is long, uses several random words, and would take centuries to guess."
        }
      }
    ]
  },
  {
    id: 'qr',
    caseNumber: 'CASE 3',
    codename: 'CHALLENGE 3: FAKE QR CODES',
    title: 'QR Code Safety',
    story: "Scammers sometimes stick fake QR code stickers over real ones in public places. Examine each code before scanning.",
    color: 'blue',
    icon: '▦',
    scenarios: [
      {
        id: 'qr1',
        type: 'qr',
        difficulty: 'LEVEL 1 · STICKER ON A PARKING METER',
        context: 'Downtown Parking Meter #42',
        headline: 'QUICK PARK EXPRESS',
        copy: 'A paper sticker stuck directly over the city parking machine screen.',
        destination: 'https://city-parking-pay-express.net/meter-charge',
        warningSign: 'The sticker is peeling at the corners and covers the official phone number.',
        correctAction: 'block',
        points: 100,
        signal: 'A suspicious sticker was pasted on top! Real city parking meters have official painted instructions, not peeling stickers.',
        companionReaction: {
          correct: "Eagle eye! You noticed the sticker pasted over the real meter. That fake website would have stolen your card info.",
          wrong: "Watch out! You scanned a fake sticker stuck by a scammer over the parking machine. It leads to a phishing payment site."
        }
      },
      {
        id: 'qr2',
        type: 'qr',
        difficulty: 'LEVEL 2 · RESTAURANT BILL',
        context: 'Downtown Cafe · Table #12',
        headline: 'YOUR BILL & RECEIPT',
        copy: 'Receipt printed directly from the table checkout machine by your server.',
        destination: 'https://downtowncafe.com/bill/chk-902',
        warningSign: 'Printed cleanly on paper with the correct food items and table number.',
        correctAction: 'trust',
        points: 100,
        signal: 'This is safe: freshly printed right at your table, with the correct table number and official cafe website link.',
        companionReaction: {
          correct: "Sensible! Not every QR code is a scam. A freshly printed receipt at your table is completely safe to scan.",
          wrong: "You refused to scan the waiter's printed receipt? Don't worry, a receipt printed right at your table is completely safe."
        }
      },
      {
        id: 'qr3',
        type: 'qr',
        difficulty: 'LEVEL 3 · UNKNOWN DOWNLOAD LINK',
        context: 'Subway Station Wall Poster',
        headline: 'FREE WI-FI + $10 GIFT',
        copy: 'Poster offering free internet if you download a special file onto your phone.',
        destination: 'https://free-metro-wifi.biz/setup-download',
        warningSign: 'Asks you to download and install an unknown configuration file onto your phone.',
        correctAction: 'block',
        points: 150,
        signal: 'Never download unknown files or settings for "free Wi-Fi"! Scammers can use them to spy on your internet traffic.',
        companionReaction: {
          correct: "Saved your phone! Anyone asking you to download unknown setup files for 'free Wi-Fi' is trying to spy on you.",
          wrong: "Big danger! Downloading unknown setup files gives strangers permission to monitor what you do on your phone."
        }
      }
    ]
  },
  {
    id: 'scams',
    caseNumber: 'CASE 4',
    codename: 'CHALLENGE 4: SCAM TEXT MESSAGES',
    title: 'Scam Text Messages',
    story: "Scammers send urgent text messages pretending to be family members, banks, or delivery services. Can you spot the traps?",
    color: 'orange',
    icon: '◌',
    scenarios: [
      {
        id: 'sms1',
        type: 'sms',
        difficulty: 'LEVEL 1 · URGENT FAMILY MESSAGE',
        sender: '+1 (555) 019-8831',
        senderLabel: 'Unknown Number',
        messages: [
          'Hi Mum, I dropped my phone in water and it broke. This is my temporary number.',
          'Can you transfer $350 for an emergency repair? I am stuck at the shop right now.'
        ],
        destinationUrl: null,
        correctAction: 'block',
        points: 100,
        signal: 'Classic "Fake Family" scam: an unknown number claims to be a loved one in trouble and asks for instant cash.',
        companionReaction: {
          correct: "Blocked! Always call your family member on their real known number before ever sending money.",
          wrong: "You almost sent $350 to a scammer pretending to be your family! Always call their real number first to check."
        }
      },
      {
        id: 'sms2',
        type: 'sms',
        difficulty: 'LEVEL 2 · REAL LOGIN CODE',
        sender: 'SAFE BANK (72911)',
        senderLabel: 'Official Bank Number',
        messages: [
          'Security Alert: 839-102 is your verification code for your bank account.',
          'Bank staff will NEVER call or text asking for this code. Do NOT share it with anyone.'
        ],
        destinationUrl: null,
        correctAction: 'trust',
        points: 100,
        signal: 'This is a genuine verification code: it has no strange links and reminds you never to share it with anyone.',
        companionReaction: {
          correct: "Correct! That's a real login code. Notice it has no suspicious links and clearly tells you not to share it.",
          wrong: "You blocked your own login code! This message was legitimate, sent from the bank to confirm your login."
        }
      },
      {
        id: 'sms3',
        type: 'sms',
        difficulty: 'LEVEL 3 · FAKE DELIVERY FEE',
        sender: 'Postal Delivery (+1 555-0921)',
        senderLabel: 'Delivery Alert',
        messages: [
          'Your package is on hold at our local depot due to an unpaid delivery fee of $1.49.',
          'Please confirm your address and pay the fee now: https://express-package-fee.cc/pay'
        ],
        destinationUrl: 'https://express-package-fee.cc/pay',
        correctAction: 'block',
        points: 150,
        signal: 'The tiny $1.49 fee is bait to make you let your guard down and type your credit card details into a fake website.',
        companionReaction: {
          correct: "Nailed it! The tiny $1.49 fee is a trick so you don't think twice before typing your credit card details.",
          wrong: "Gotcha! Scammers use tiny fees like $1.49 so you won't hesitate to type in your card details on their fake site."
        }
      }
    ]
  }
];
