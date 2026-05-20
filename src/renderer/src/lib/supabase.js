import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://czcfasxrsijcwacsfmme.supabase.co'
const supabaseKey = 'sb_publishable_ocVEuq1MDzVCDy0M1RRQ4g__-nz2p8h'

export const supabase = createClient(supabaseUrl, supabaseKey)