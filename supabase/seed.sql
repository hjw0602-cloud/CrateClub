insert into public.artists (id, name, slug) values
('10000000-0000-0000-0000-000000000001', 'NOA', 'noa'),
('10000000-0000-0000-0000-000000000002', 'MISO', 'miso'),
('10000000-0000-0000-0000-000000000003', 'YUNB', 'yunb'),
('10000000-0000-0000-0000-000000000004', 'LÉON', 'leon'),
('10000000-0000-0000-0000-000000000005', 'DUSTY', 'dusty'),
('10000000-0000-0000-0000-000000000006', 'HANA', 'hana')
on conflict (slug) do nothing;

insert into public.releases (id, artist_id, title, slug, release_type, release_date, genres, description, cover_url, status, published_at) values
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','AFTERIMAGE','afterimage','ALBUM','2026-07-18',array['Alternative R&B','Neo Soul'],'침묵과 잔향 사이를 오가는 열두 개의 장면.','/images/featured-cover.png','published',now()),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','BLUE HOUR','blue-hour','EP','2026-07-17',array['R&B','UK Garage'],'새벽 두 시의 도시를 닮은 짧고 선명한 다섯 곡.',null,'published',now()),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','NO SKIP','no-skip','MIXTAPE','2026-07-15',array['Hip-Hop','Boom Bap'],'과장 없이 단단한 랩과 샘플링으로 밀어붙이는 믹스테이프.',null,'published',now()),
('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000004','PETALS','petals','SINGLE','2026-07-14',array['Soul','R&B'],'절제된 보컬과 현악 편곡이 천천히 피어나는 싱글.',null,'published',now()),
('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000005','HEAT CHECK','heat-check','ALBUM','2026-07-11',array['Trap','Southern Hip-Hop'],'뜨거운 저역과 느슨한 플로우로 채운 여름의 기록.',null,'published',now()),
('20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000006','SOFT FOCUS','soft-focus','EP','2026-07-09',array['Dream Pop','Alternative R&B'],'흐릿한 기타와 가까운 목소리가 만든 사적인 풍경.',null,'published',now())
on conflict (slug) do nothing;
