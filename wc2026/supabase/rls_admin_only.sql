-- ==========================================
-- Fix RLS: Admin can manage matches, Superuser can only settle
-- ==========================================

-- Drop old match policies
DROP POLICY IF EXISTS "matches_insert_op" ON matches;
DROP POLICY IF EXISTS "matches_update_op" ON matches;
DROP POLICY IF EXISTS "matches_insert_admin" ON matches;
DROP POLICY IF EXISTS "matches_update_admin" ON matches;
DROP POLICY IF EXISTS "matches_insert_admin_super" ON matches;
DROP POLICY IF EXISTS "matches_update_admin_super" ON matches;

-- Create new policies: only admin can insert matches, admin/superuser can update (for settle)
CREATE POLICY "matches_insert_admin_only" ON matches FOR INSERT TO authenticated
  WITH CHECK (my_role() = 'admin');

CREATE POLICY "matches_update_admin_super" ON matches FOR UPDATE TO authenticated
  USING (my_role() IN ('admin', 'superuser'));

-- Also restrict settle_match function to admin or superuser
CREATE OR REPLACE FUNCTION settle_match(
  p_match_id   UUID,
  p_home_score INTEGER,
  p_away_score INTEGER
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_match matches;
BEGIN
  IF (SELECT role FROM profiles WHERE id = auth.uid()) NOT IN ('admin', 'superuser') THEN
    RETURN jsonb_build_object('success',false,'error','Unauthorized');
  END IF;

  SELECT * INTO v_match FROM matches WHERE id = p_match_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success',false,'error','Match not found');
  END IF;
  IF v_match.status NOT IN ('SCHEDULED','LIVE') THEN
    RETURN jsonb_build_object('success',false,'error','Match not in settable state');
  END IF;

  UPDATE matches SET
    status                  = 'PENDING_SETTLEMENT',
    home_score              = p_home_score,
    away_score              = p_away_score,
    settlement_requested_at = NOW(),
    updated_at              = NOW()
  WHERE id = p_match_id;

  RETURN jsonb_build_object(
    'success', true,
    'match_id', p_match_id,
    'status', 'PENDING_SETTLEMENT',
    'settles_at', (NOW() + INTERVAL '15 minutes')
  );
END;
$$;

-- Restrict confirm_match_settlement to admin only
CREATE OR REPLACE FUNCTION confirm_match_settlement(p_match_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_match matches;
BEGIN
  IF (SELECT role FROM profiles WHERE id = auth.uid()) != 'admin' THEN
    RETURN jsonb_build_object('success',false,'error','Unauthorized');
  END IF;

  SELECT * INTO v_match FROM matches WHERE id = p_match_id FOR UPDATE;

  IF v_match.status <> 'PENDING_SETTLEMENT' THEN
    RETURN jsonb_build_object('success',false,'error','Not pending');
  END IF;
  IF v_match.settlement_requested_at > NOW() - INTERVAL '15 minutes' THEN
    RETURN jsonb_build_object(
      'success', false, 'error', 'Window still open',
      'seconds_remaining',
      EXTRACT(EPOCH FROM (v_match.settlement_requested_at + INTERVAL '15 minutes' - NOW()))::INTEGER
    );
  END IF;

  UPDATE matches SET status = 'SETTLED', updated_at = NOW() WHERE id = p_match_id;

  RETURN jsonb_build_object('success',true,'match_id',p_match_id,'status','SETTLED');
END;
$$;

-- Restrict audit_log to admin or superuser
DROP POLICY IF EXISTS "audit_read_ops" ON audit_log;
DROP POLICY IF EXISTS "audit_read_admin" ON audit_log;
DROP POLICY IF EXISTS "audit_read_admin_super" ON audit_log;
CREATE POLICY "audit_read_admin_super" ON audit_log FOR SELECT TO authenticated
  USING (my_role() IN ('admin', 'superuser'));

