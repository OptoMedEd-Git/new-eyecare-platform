-- 017_flashcards_seed.sql
-- Sample flashcards for development. Run AFTER 017_flashcards.sql.
-- Uses blog_categories slugs from 001/011 (glaucoma, anterior-segment, etc.).

DO $$
DECLARE
  author uuid := (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1);
  cat_glaucoma uuid := (SELECT id FROM blog_categories WHERE slug = 'glaucoma' LIMIT 1);
  cat_anterior uuid := (SELECT id FROM blog_categories WHERE slug = 'anterior-segment' LIMIT 1);
  cat_posterior uuid := (SELECT id FROM blog_categories WHERE slug = 'posterior-segment' LIMIT 1);
  cat_imaging uuid := (SELECT id FROM blog_categories WHERE slug = 'diagnostics-imaging' LIMIT 1);
  cat_neuro uuid := (SELECT id FROM blog_categories WHERE slug = 'neuro-ophthalmology' LIMIT 1);
BEGIN
  IF author IS NULL THEN
    RAISE EXCEPTION '017_flashcards_seed requires at least one profiles row';
  END IF;

  -- Glaucoma (5)
  INSERT INTO flashcards (front, back, category_id, target_audience, difficulty, status, author_id, published_at) VALUES
    ('First-line topical therapy for POAG?', 'Prostaglandin analogs (latanoprost, travoprost, bimatoprost) — once-daily dosing, substantial IOP reduction.', cat_glaucoma, 'practicing', 'foundational', 'published', author, now()),
    ('Normal IOP range (mmHg)?', 'Roughly 10–21 mmHg with diurnal variation of a few mmHg commonly seen.', cat_glaucoma, 'student', 'foundational', 'published', author, now()),
    ('Trabeculectomy: name three key complications.', 'Hypotony, bleb leak/bleb-related infection risk, cataract progression; choroidal effusion possible early.', cat_glaucoma, 'resident', 'intermediate', 'published', author, now()),
    ('What does a prostaglandin analog classically do to the iris?', 'May increase iris and periorbital pigmentation; hypertrichosis can occur.', cat_glaucoma, 'student', 'foundational', 'published', author, now()),
    ('When is laser trabeculoplasty (SLT) often considered?', 'Open-angle glaucoma when meds inadequate or poorly tolerated; sometimes as adjunct to drops.', cat_glaucoma, 'practicing', 'intermediate', 'published', author, now());

  -- Anterior segment (5)
  INSERT INTO flashcards (front, back, category_id, target_audience, difficulty, status, author_id, published_at) VALUES
    ('Herpes simplex keratitis: dendritic pattern is caused by?', 'Epithelial involvement with branching ulcers; stain well with fluorescein.', cat_anterior, 'resident', 'intermediate', 'published', author, now()),
    ('Bacterial keratitis: most common organism in contact lens wearers?', 'Pseudomonas aeruginosa is classically emphasized; gram positives also common.', cat_anterior, 'practicing', 'intermediate', 'published', author, now()),
    ('Acute angle closure: first-line medical IOP reduction often includes?', 'Topical beta-blocker, alpha agonist, CAI; systemic acetazolamide; pilocarpine after IOP begins to fall.', cat_anterior, 'student', 'advanced', 'published', author, now()),
    ('Fuchs endothelial dystrophy: early morning blur improves why?', 'Corneal edema overnight; clears somewhat as day progresses with evaporation.', cat_anterior, 'practicing', 'foundational', 'published', author, now()),
    ('Stevens-Johnson ocular sequelae may include?', 'Severe dry eye, symblepharon, limbal stem cell deficiency, corneal neovascularization.', cat_anterior, 'resident', 'advanced', 'published', author, now());

  -- Posterior segment (5)
  INSERT INTO flashcards (front, back, category_id, target_audience, difficulty, status, author_id, published_at) VALUES
    ('CRVO: risk of neovascular glaucoma relates to?', 'Ischemic CRVO with extensive capillary nonperfusion — iris neovascularization risk.', cat_posterior, 'resident', 'intermediate', 'published', author, now()),
    ('AMD dry vs wet hallmark?', 'Wet AMD has choroidal neovascularization/leakage; dry has drusen and geographic atrophy without CNV.', cat_posterior, 'student', 'foundational', 'published', author, now()),
    ('Rhegmatogenous RD: most common vitreoretinal traction mechanism?', 'Posterior vitreous detachment with retinal tear allowing subretinal fluid.', cat_posterior, 'practicing', 'foundational', 'published', author, now()),
    ('Diabetic macular edema: anti-VEGF vs steroid intraocular?', 'Anti-VEGF first-line commonly; steroids considered pseudophakic or refractory cases per guidelines.', cat_posterior, 'practicing', 'intermediate', 'published', author, now()),
    ('Lattice degeneration significance?', 'Peripheral retinal thinning associated with higher risk of retinal tears/detachment in some eyes.', cat_posterior, 'student', 'foundational', 'published', author, now());

  -- Diagnostic imaging (5)
  INSERT INTO flashcards (front, back, category_id, target_audience, difficulty, status, author_id, published_at) VALUES
    ('OCT RNFL: green/yellow/red maps interpret as?', 'Compare to normative database — thinning suggests glaucoma damage when clinical correlation.', cat_imaging, 'resident', 'intermediate', 'published', author, now()),
    ('FA early hyperfluorescence without leakage suggests?', 'Window defect (RPE atrophy) or autofluorescence artifact — pattern matters with late frames.', cat_imaging, 'practicing', 'advanced', 'published', author, now()),
    ('B-scan ultrasound useful when?', 'Media opacity blocking fundus view; choroidal mass; posterior segment RD confirmation.', cat_imaging, 'student', 'foundational', 'published', author, now()),
    ('Humphrey 24-2 vs 10-2 in advanced glaucoma?', '10-2 can monitor central field more closely when 24-2 shows only central island.', cat_imaging, 'practicing', 'intermediate', 'published', author, now()),
    ('ICG angiography especially helpful for?', 'Choroidal circulation — PCV, choroidal tumors, some inflammatory conditions.', cat_imaging, 'resident', 'intermediate', 'published', author, now());

  -- Neuro-ophthalmology (5)
  INSERT INTO flashcards (front, back, category_id, target_audience, difficulty, status, author_id, published_at) VALUES
    ('Third nerve palsy with pupil involvement suggests?', 'Compressive lesion (e.g., PCA aneurysm) until proven otherwise — urgent neuroimaging.', cat_neuro, 'resident', 'advanced', 'published', author, now()),
    ('Internuclear ophthalmoplegia localizes to?', 'Medial longitudinal fasciculus (MLF) — often MS in young adults.', cat_neuro, 'student', 'intermediate', 'published', author, now()),
    ('Optic neuritis classic visual field?', 'Central scotoma common; pain with eye movement frequent in idiopathic demyelinating cases.', cat_neuro, 'practicing', 'foundational', 'published', author, now()),
    ('Horner syndrome triad?', 'Miosis, mild ptosis, anhidrosis — confirm with apraclonidine/cocaine testing patterns.', cat_neuro, 'student', 'foundational', 'published', author, now()),
    ('Giant cell arteritis: ocular emergency presentation?', 'AION with altitudinal field loss; jaw claudication; elevated ESR/CRP — steroids urgently.', cat_neuro, 'practicing', 'advanced', 'published', author, now());
END $$;
