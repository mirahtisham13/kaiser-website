-- Create the site_settings table
CREATE TABLE public.site_settings (
    id integer PRIMARY KEY DEFAULT 1,
    about_text text NOT NULL DEFAULT '',
    message_text text NOT NULL DEFAULT '',
    address text NOT NULL DEFAULT '',
    phone text NOT NULL DEFAULT '',
    email text NOT NULL DEFAULT '',
    timings text NOT NULL DEFAULT '',
    fee_amount text NOT NULL DEFAULT '',
    instagram_url text NOT NULL DEFAULT '',
    facebook_url text NOT NULL DEFAULT '',
    twitter_url text NOT NULL DEFAULT '',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure only one row can exist
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert the default starting row based on current index.html content
INSERT INTO public.site_settings (
    id,
    about_text,
    message_text,
    address,
    phone,
    email,
    timings,
    fee_amount,
    instagram_url,
    facebook_url,
    twitter_url
) VALUES (
    1,
    'Providing reliable dental services at the premier Dental Clinic in Kashmir. Focused on honest treatment, patient comfort, and long-term dental health as the Best Dentist in Vilgam.',
    '"I started this clinic because I believe every person in Kashmir deserves quality dental care — not just in big cities. Whether it''s a routine check-up or a smile transformation, I treat every patient the way I''d treat my own family. I''m here to listen, explain, and help — without rush or pressure. Come in, let''s talk about your smile."',
    'Vilgam, Jammu and Kashmir, 193224',
    '+91 7889439422',
    'kaisermir04@gmail.com',
    '9:00 AM – 6:00 PM',
    '₹200',
    'https://www.instagram.com/drkaisermir',
    'https://www.facebook.com/share/17TNqAj5xi/',
    'https://x.com/kaisermir04'
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to site_settings"
    ON public.site_settings FOR SELECT
    USING (true);

-- Allow authenticated admins to update
CREATE POLICY "Allow authenticated update to site_settings"
    ON public.site_settings FOR UPDATE
    USING (auth.role() = 'authenticated');
