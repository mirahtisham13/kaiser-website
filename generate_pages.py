import re

def update_file(filename, title, desc, og_title, og_desc, content_html):
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Replace Meta tags
    html = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', html)
    html = re.sub(r'<meta name="description"\s+content=".*?">', f'<meta name="description"\n        content="{desc}">', html)
    html = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{og_title}">', html)
    html = re.sub(r'<meta property="og:description"\s+content=".*?">', f'<meta property="og:description"\n        content="{og_desc}">', html)
    
    # Replace body content
    # Find </header> and <section class="appointment" id="appointment">
    start_str = '</header>'
    end_str = '    <!-- APPOINTMENT -->'
    
    start_idx = html.find(start_str)
    end_idx = html.find(end_str)
    
    if start_idx != -1 and end_idx != -1:
        start_idx += len(start_str)
        new_html = html[:start_idx] + '\n\n' + content_html + '\n\n' + html[end_idx:]
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Updated {filename}")
    else:
        print(f"Failed to find injection points in {filename}")

# --- Implants ---
implants_content = """
    <section class="hero" style="padding:120px 0 60px; min-height:auto; text-align:center;">
        <div class="container">
            <span class="section-tag">Restorative Dentistry</span>
            <h1 class="hero__title" style="font-size:3rem; margin-bottom:16px;">Dental Implants in Vilgam, Kashmir</h1>
            <p class="hero__desc" style="max-width:700px; margin:0 auto;">Permanent, natural-looking replacements for missing teeth. Regain your confidence and bite strength with state-of-the-art implant technology at Dr. Kaiser's Dental Clinic.</p>
        </div>
    </section>

    <section class="about" style="padding-top:40px;">
        <div class="container">
            <div class="about__grid">
                <div class="about__image" style="background:#f8fafc; display:flex; align-items:center; justify-content:center; border-radius:16px;">
                    <div style="font-size:80px; padding:60px;">🦷</div>
                </div>
                <div class="about__content">
                    <h2 class="section-title">Why Choose Dental Implants?</h2>
                    <p class="about__text">Unlike traditional dentures or bridges, dental implants are surgically anchored into your jawbone. This prevents bone loss, ensures they never slip while speaking or eating, and provides a lifetime solution for missing teeth.</p>
                    <ul style="list-style:none; padding:0; margin-top:20px;">
                        <li style="margin-bottom:12px;">✅ <strong>Look and feel</strong> exactly like natural teeth.</li>
                        <li style="margin-bottom:12px;">✅ <strong>Preserve jawbone</strong> and facial structure.</li>
                        <li style="margin-bottom:12px;">✅ <strong>Eat anything</strong> without worry.</li>
                        <li style="margin-bottom:12px;">✅ <strong>High success rate</strong> of over 95%.</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
"""

# --- Braces ---
braces_content = """
    <section class="hero" style="padding:120px 0 60px; min-height:auto; text-align:center;">
        <div class="container">
            <span class="section-tag">Orthodontics</span>
            <h1 class="hero__title" style="font-size:3rem; margin-bottom:16px;">Braces & Aligners in Kashmir</h1>
            <p class="hero__desc" style="max-width:700px; margin:0 auto;">Straighten your teeth and correct your bite. We offer traditional metal braces, ceramic braces, and clear aligners for kids, teens, and adults.</p>
        </div>
    </section>

    <section class="about" style="padding-top:40px;">
        <div class="container">
            <div class="about__grid">
                <div class="about__image" style="background:#f8fafc; display:flex; align-items:center; justify-content:center; border-radius:16px;">
                    <div style="font-size:80px; padding:60px;">🔗</div>
                </div>
                <div class="about__content">
                    <h2 class="section-title">Your Journey to a Straight Smile</h2>
                    <p class="about__text">Crooked or misaligned teeth don't just affect your confidence; they can lead to jaw pain and difficulty cleaning your teeth. Orthodontic treatment gently shifts your teeth into their perfect positions.</p>
                    <ul style="list-style:none; padding:0; margin-top:20px;">
                        <li style="margin-bottom:12px;">✅ <strong>Metal Braces</strong>: The most durable and cost-effective option.</li>
                        <li style="margin-bottom:12px;">✅ <strong>Ceramic Braces</strong>: Tooth-colored brackets for a more discreet look.</li>
                        <li style="margin-bottom:12px;">✅ <strong>Clear Aligners</strong>: Invisible, removable trays for ultimate comfort.</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
"""

# --- Smile Makeovers ---
smile_content = """
    <section class="hero" style="padding:120px 0 60px; min-height:auto; text-align:center;">
        <div class="container">
            <span class="section-tag">Cosmetic Dentistry</span>
            <h1 class="hero__title" style="font-size:3rem; margin-bottom:16px;">Smile Makeovers in Vilgam</h1>
            <p class="hero__desc" style="max-width:700px; margin:0 auto;">Transform your smile with a customized combination of veneers, teeth whitening, composite bonding, and gum contouring.</p>
        </div>
    </section>

    <section class="about" style="padding-top:40px;">
        <div class="container">
            <div class="about__grid">
                <div class="about__image" style="background:#f8fafc; display:flex; align-items:center; justify-content:center; border-radius:16px;">
                    <div style="font-size:80px; padding:60px;">😁</div>
                </div>
                <div class="about__content">
                    <h2 class="section-title">What is a Smile Makeover?</h2>
                    <p class="about__text">A smile makeover is a completely personalized treatment plan designed to address your specific cosmetic concerns, whether that's stained, chipped, gapped, or uneven teeth.</p>
                    <ul style="list-style:none; padding:0; margin-top:20px;">
                        <li style="margin-bottom:12px;">✅ <strong>Porcelain Veneers</strong> to instantly fix shape and color.</li>
                        <li style="margin-bottom:12px;">✅ <strong>Teeth Whitening</strong> for a brilliantly bright smile.</li>
                        <li style="margin-bottom:12px;">✅ <strong>Composite Bonding</strong> to repair minor chips easily.</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
"""

update_file('implants.html', 
            'Dental Implants in Kashmir | Dr. Kaiser Dental', 
            'Permanent dental implants in Vilgam, Kashmir. Replace missing teeth with natural-looking, durable implants. Book your consultation with Dr. Kaiser today.',
            'Dental Implants in Kashmir | Dr. Kaiser Dental',
            'Permanent dental implants in Vilgam, Kashmir.',
            implants_content)

update_file('braces.html', 
            'Braces & Orthodontics in Kashmir | Dr. Kaiser Dental', 
            'Straighten your teeth with braces and clear aligners in Vilgam, Kashmir. Affordable orthodontic treatment for kids and adults.',
            'Braces & Orthodontics in Kashmir | Dr. Kaiser Dental',
            'Affordable braces and clear aligners in Vilgam, Kashmir.',
            braces_content)

update_file('smile-makeovers.html', 
            'Smile Makeovers in Kashmir | Dr. Kaiser Dental', 
            'Get a Hollywood smile in Kashmir. Veneers, teeth whitening, and cosmetic bonding at Dr. Kaiser\'s Dental Clinic, Vilgam.',
            'Smile Makeovers in Kashmir | Dr. Kaiser Dental',
            'Veneers and cosmetic dentistry in Vilgam, Kashmir.',
            smile_content)

