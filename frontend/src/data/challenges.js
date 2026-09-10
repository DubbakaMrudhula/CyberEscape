export const challenges = [
  {
    id: 'phishing',
    number: '01',
    title: 'Phishing Vectors',
    eyebrow: 'Infiltration / Email Protocol',
    color: 'coral',
    icon: '✉',
    description: 'Inspect the headers, links, and tone before interacting. Subtle lookalikes deceive the untrained eye.',
    scenarios: [
      {
        id: 'p1',
        type: 'email',
        difficulty: 'LEVEL 1 · OBVIOUS RED FLAG',
        subject: 'URGENT: Your account will be locked within 24 hours',
        sender: 'Security Support <security-alert@micros0ft-verif.net>',
        recipient: 'to: you@workplace.com',
        destinationUrl: 'https://micros0ft-verif.net/login/auth-session',
        previewText: 'Unusual login from unknown location. Click immediately to authenticate.',
        body: 'Dear Customer,\n\nWe detected unauthorized access attempts from IP 185.220.101.5. To protect your profile, verify your identity within 24 hours or your cloud vault will be suspended indefinitely.\n\n[VERIFY CREDENTIALS NOW]',
        actionText: 'VERIFY CREDENTIALS NOW',
        answer: 'unsafe',
        points: 100,
        signal: 'The sender domain uses a zero "micros0ft" instead of an "o" on an external domain (.net), combined with high-urgency panic language.'
      },
      {
        id: 'p2',
        type: 'email',
        difficulty: 'LEVEL 2 · LOOK CLOSER (DECOY)',
        subject: 'Updated team offsite schedule (no action needed)',
        sender: 'Maya Lin <maya.lin@northstar-corp.com>',
        recipient: 'to: all-designers@northstar-corp.com',
        destinationUrl: null,
        previewText: 'Here is the agenda for Thursday. See you all there!',
        body: 'Hi everyone,\n\nI finalized the agenda for Thursday\'s workshop. We will kick off at 10:00 AM in Conference Room B. Lunch will be catered.\n\nNo preparation is needed on your end. See you then!\n\nBest,\nMaya Lin\nNorthstar Operations',
        actionText: null,
        answer: 'safe',
        points: 100,
        signal: 'Authentic internal communication. It comes from a legitimate verified company domain, contains no external hyperlinks, requests no credentials, and applies zero pressure.'
      },
      {
        id: 'p3',
        type: 'email',
        difficulty: 'LEVEL 3 · MASTER CYBER TEAMS',
        subject: 'Overdue Vendor Invoice #88419-B',
        sender: 'Accounts Payable <billing@northstar-corp.co>',
        recipient: 'to: accounts@northstar-corp.com',
        destinationUrl: 'https://northstar-corp.co.portal-invoicing.com/pay/88419',
        previewText: 'Invoice attached. Please remit payment immediately to avoid penalties.',
        body: 'Hello Finance,\n\nPlease find the revised remittance breakdown for last month\'s cloud hosting retainer. Surcharge fees apply after 5:00 PM today.\n\nInspect your invoice breakdown here:\n[VIEW INVOICE DOCUMENT]',
        actionText: 'VIEW INVOICE DOCUMENT',
        answer: 'unsafe',
        points: 150,
        signal: 'Extremely tricky subdomain spoofing! The link appears to mention northstar-corp.co, but the root domain is actually "portal-invoicing.com", and the sender uses a lookalike (.co instead of .com).'
      }
    ]
  },
  {
    id: 'passwords',
    number: '02',
    title: 'Password Entropy',
    eyebrow: 'Access Control / Cryptanalysis',
    color: 'lime',
    icon: '✦',
    description: 'Complexity rules (adding an exclamation mark or digit) do not protect against dictionary attacks. Entropy and length rule supreme.',
    scenarios: [
      {
        id: 'pass1',
        type: 'password',
        difficulty: 'LEVEL 1 · DICTIONARY TRAP',
        label: 'Candidate: Seasonal Pattern',
        value: 'Autumn2024!',
        entropy: 34,
        crackTime: '3.4 seconds (GPU dictionary hash attack)',
        answer: 'weak',
        points: 100,
        signal: 'Capitalized season + recent year + exclamation mark is one of the top 10 most common corporate patterns in breached credential databases.'
      },
      {
        id: 'pass2',
        type: 'password',
        difficulty: 'LEVEL 2 · KEYBOARD WALK',
        label: 'Candidate: Sequence Walk',
        value: 'qwerty!@#123',
        entropy: 28,
        crackTime: 'Instantaneous (< 0.1 sec)',
        answer: 'weak',
        points: 100,
        signal: 'Keyboard walk patterns ("qwerty", "!@#", "123") have almost zero mathematical entropy because attackers crack sequence algorithms first.'
      },
      {
        id: 'pass3',
        type: 'password',
        difficulty: 'LEVEL 3 · HIGH ENTROPY PASSPHRASE',
        label: 'Candidate: Diceware Multi-word',
        value: 'cobalt-velvet#orbit94-falcon',
        entropy: 96,
        crackTime: '420,000 centuries',
        answer: 'strong',
        points: 150,
        signal: 'Four unrelated dictionary words combined with distinct delimiters and numeric anchors produce massive entropy while remaining memorable without predictable patterns.'
      }
    ]
  },
  {
    id: 'qr',
    number: '03',
    title: 'QR Code Tampering',
    eyebrow: 'Physical Vectors / Quishing',
    color: 'blue',
    icon: '▦',
    description: 'QR codes are unreadable to human eyes without scanning. Physical overlays and lure posters redirect unsuspecting victims to credential harvesters.',
    scenarios: [
      {
        id: 'qr1',
        type: 'qr',
        difficulty: 'LEVEL 1 · PHYSICAL STICKER OVERLAY',
        context: 'Downtown Street Meter · Machine #42',
        headline: 'QUICK PARK EXPRESS',
        copy: 'A glossy vinyl sticker slapped directly over the city parking machine\'s original payment instructions.',
        destination: 'https://city-parking-pay-express.net/meter-charge',
        warningSign: 'Sticker peeling at corners; covers city hotline number.',
        answer: 'unsafe',
        points: 100,
        signal: 'Physical QR sticker placed over the legitimate parking kiosk plate. Cities do not paste temporary third-party stickers asking for quick card details.'
      },
      {
        id: 'qr2',
        type: 'qr',
        difficulty: 'LEVEL 2 · PRINTED RESTAURANT RECEIPT (DECOY)',
        context: 'Olive & Oak Bistro · Table #12',
        headline: 'YOUR DIGITAL BILL & RECEIPT',
        copy: 'Thermal receipt freshly printed from the POS terminal right in front of you.',
        destination: 'https://oliveandoakbistro.com/bill/chk-902',
        warningSign: 'Printed as part of the thermal register spool with matching server name.',
        answer: 'safe',
        points: 100,
        signal: 'Genuine low-risk context: The receipt is generated directly by the dining room POS terminal and leads to the restaurant’s official verified domain.'
      },
      {
        id: 'qr3',
        type: 'qr',
        difficulty: 'LEVEL 3 · COVERT TRANSIT LURE',
        context: 'Subway Station · "Free Public Wi-Fi"',
        headline: 'HIGH-SPEED METRO WI-FI + $5 GIFT',
        copy: 'Laminated poster on an emergency pole. Scan to download certificate and claim commuter perk.',
        destination: 'https://metro-transit-connect.org.free-wifi.biz/cert.mobileconfig',
        warningSign: 'Asks to download a mobile configuration profile or enterprise certificate.',
        answer: 'unsafe',
        points: 150,
        signal: 'High danger: Prompting users to install a profile/certificate (.mobileconfig) under the guise of free Wi-Fi enables malicious root certificates and MITM inspection.'
      }
    ]
  },
  {
    id: 'scams',
    number: '04',
    title: 'Social Engineering SMS',
    eyebrow: 'Mobile Telephony / Smishing',
    color: 'orange',
    icon: '◌',
    description: 'Attackers leverage panic, family crises, or unpaid trivial delivery fees to bypass caution on personal phones.',
    scenarios: [
      {
        id: 'sms1',
        type: 'sms',
        difficulty: 'LEVEL 1 · URGENT FAMILY IMPERSONATION',
        sender: '+1 (555) 019-8831',
        senderLabel: 'Unknown Number',
        messages: [
          'Mum, dropped my phone in the sink and the screen died. This is my temporary SIM.',
          'Could you transfer $350 for an emergency repair deposit? I am stuck at the shop right now.'
        ],
        destinationUrl: null,
        answer: 'unsafe',
        points: 100,
        signal: 'Classic "Hi Mum/Dad" impersonation scam. The fraudster creates emergency distress from an unknown number to extract wire transfers before you can call their real number.'
      },
      {
        id: 'sms2',
        type: 'sms',
        difficulty: 'LEVEL 2 · AUTOMATED BANK 2FA (DECOY)',
        sender: 'NORTHSTAR BANK (Shortcode: 72911)',
        senderLabel: 'Verified Banking Gateway',
        messages: [
          'Northstar Alert: 839-102 is your one-time verification passcode for card ending 4410.',
          'Northstar employees will NEVER call or text asking for this code. Do NOT share it with anyone.'
        ],
        destinationUrl: null,
        answer: 'safe',
        points: 100,
        signal: 'Legitimate 2FA notification! It contains no external phishing URLs and explicitly reinforces cybersecurity best practices: never share the code with anyone.'
      },
      {
        id: 'sms3',
        type: 'sms',
        difficulty: 'LEVEL 3 · THE UNPAID POSTAGE TRAP',
        sender: 'ExpressPost Global (+1 555-0921)',
        senderLabel: 'Courier Logistics',
        messages: [
          'Package #US-982194 is held at our depot due to an unpaid dispatch customs fee of $1.49.',
          'Update your shipping address and settle fee immediately: https://expresspost-delivery.cc/clearance'
        ],
        destinationUrl: 'https://expresspost-delivery.cc/clearance',
        answer: 'unsafe',
        points: 150,
        signal: 'Trivial fee psychology! The tiny $1.49 fee lowers victim hesitation, leading to an unauthorized external payment gateway (.cc TLD) designed to harvest full credit card credentials.'
      }
    ]
  }
];
