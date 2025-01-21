-- Create function to generate secure invitation tokens
create or replace function generate_invitation_token()
returns jsonb
language plpgsql
security definer
as $$
declare
  result text;
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z}';
  i integer := 0;
  random_bytes bytea;
begin
  -- Generate 32 random characters for the token
  random_bytes := gen_random_bytes(32);
  result := '';
  for i in 1..32 loop
    result := result || chars[1 + (get_byte(random_bytes, i - 1) % array_length(chars, 1))];
  end loop;
  
  -- Return as a JSON object with a token field
  return jsonb_build_object('token', result);
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function generate_invitation_token() to authenticated; 