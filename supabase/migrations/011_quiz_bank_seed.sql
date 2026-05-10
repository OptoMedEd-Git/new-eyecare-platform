-- 011_quiz_bank_seed.sql
-- Sample quiz bank items for development. Run AFTER 011_quiz_bank.sql.
-- Assigns questions to the earliest-created profile (requires at least one row in profiles).
-- If /admin/quiz-bank shows no rows after seeding, run:
--   UPDATE quiz_questions SET author_id = '<your-auth-uuid>' WHERE author_id IS NOT NULL;
-- (RLS limits the admin list to rows where author_id = current user.)
-- Categories map to blog_categories slugs from migration 001:
-- glaucoma, anterior-segment, posterior-segment, diagnostics-imaging, neuro-ophthalmology.

DO $$
DECLARE
  q_id uuid;
  author uuid := (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1);
  cat_glaucoma uuid := (SELECT id FROM blog_categories WHERE slug = 'glaucoma' LIMIT 1);
  cat_anterior uuid := (SELECT id FROM blog_categories WHERE slug = 'anterior-segment' LIMIT 1);
  cat_posterior uuid := (SELECT id FROM blog_categories WHERE slug = 'posterior-segment' LIMIT 1);
  cat_imaging uuid := (SELECT id FROM blog_categories WHERE slug = 'diagnostics-imaging' LIMIT 1);
  cat_neuro uuid := (SELECT id FROM blog_categories WHERE slug = 'neuro-ophthalmology' LIMIT 1);
BEGIN
  IF author IS NULL THEN
    RAISE EXCEPTION 'quiz seed requires at least one profiles row';
  END IF;

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A 62-year-old woman reports gradually worsening peripheral vision over 6 months. IOP is 26 mmHg OD and 24 mmHg OS. Gonioscopy shows open angles to the ciliary body band. Automated fields show early superior arcuate defects bilaterally.',
    'Which of the following is the most appropriate first-line topical therapy?',
    'Prostaglandin analogs are typical first-line therapy for primary open-angle glaucoma due to substantial IOP lowering, once-daily dosing, and generally favorable systemic safety. Beta-blockers are useful adjuncts but carry systemic contraindications. Alpha agonists and topical carbonic anhydrase inhibitors are often adjunctive rather than sole first-line agents in uncomplicated POAG.',
    cat_glaucoma,
    'practicing',
    'intermediate'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Latanoprost 0.005% once nightly', true),
    (q_id, 1, 'Timolol 0.5% twice daily', false),
    (q_id, 2, 'Brimonidine 0.15% three times daily', false),
    (q_id, 3, 'Dorzolamide 2% three times daily', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A 58-year-old man with pseudoexfoliation glaucoma has IOP 18 mmHg on maximal tolerated medical therapy with progression on OCT RNFL. He declines incisional surgery but accepts a minimally invasive procedure.',
    'Which procedure best fits this clinical scenario?',
    'Canal-based micro-invasive glaucoma surgery options can reduce IOP with favorable safety in mild–moderate disease when trabeculectomy is deferred; trabeculectomy remains the classic incisional option with higher efficacy but more risk. Cyclophotocoagulation is typically reserved for refractory cases or poor surgical candidates. Laser peripheral iridotomy addresses angle closure, not this open-angle scenario.',
    cat_glaucoma,
    'resident',
    'advanced'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Goniotomy with trabecular meshwork bypass stent', true),
    (q_id, 1, 'Laser peripheral iridotomy', false),
    (q_id, 2, 'Panretinal photocoagulation', false),
    (q_id, 3, 'Corneal collagen cross-linking', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A 45-year-old man with open angles has IOP 32 mmHg OD and no drug allergies. You plan to start one topical agent tonight.',
    'Which statement about prostaglandin analog side effects is most accurate?',
    'Prostaglandin analogs commonly cause iris and periorbital pigmentation changes and may increase eyelash growth; they do not typically cause significant pupillary dilation like cyclic agents. Systemic beta-blocker effects are expected with timolol, not latanoprost. Significant corneal endothelial toxicity is not the hallmark adverse effect class-wide.',
    cat_glaucoma,
    'student',
    'foundational'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Hypertrichosis and increased iris pigmentation may occur', true),
    (q_id, 1, 'They reliably cause marked mydriasis', false),
    (q_id, 2, 'They are contraindicated if the patient wears contact lenses in all cases', false),
    (q_id, 3, 'They produce acute angle closure in open-angle patients', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A 70-year-old woman uses timolol and dorzolamide with IOP 22 mmHg and worsening field loss. She has asthma with occasional bronchospasm.',
    'What is the most appropriate change to her regimen?',
    'Non-selective beta-blockers like timolol can exacerbate bronchospasm and should be avoided or substituted in reactive airway disease while maintaining IOP control with other classes. Adding another beta-blocker worsens risk. Simply stopping all therapy risks progression. Oral acetazolamide may be used short-term but is not the best long-term substitute without evaluating alternatives.',
    cat_glaucoma,
    'practicing',
    'intermediate'::quiz_difficulty,
    'draft',
    author,
    NULL
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Discontinue timolol and substitute a prostaglandin analog', true),
    (q_id, 1, 'Switch timolol to oral metoprolol', false),
    (q_id, 2, 'Add oral propranolol for synergy', false),
    (q_id, 3, 'Stop all drops and observe', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'An acute angle-closure attack presents with IOP 54 mmHg, mid-dilated pupil, corneal edema, and shallow peripheral anterior chamber.',
    'After initiating systemic IOP-lowering therapy, what laser treatment is indicated once the cornea clears enough?',
    'Laser peripheral iridotomy relieves pupillary block in primary angle closure. Selective laser trabeculoplasty treats open-angle outflow. Capsulotomy addresses posterior capsule opacification. Peripheral retinal laser is unrelated.',
    cat_glaucoma,
    'resident',
    'intermediate'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Laser peripheral iridotomy', true),
    (q_id, 1, 'Selective laser trabeculoplasty', false),
    (q_id, 2, 'Nd:YAG posterior capsulotomy', false),
    (q_id, 3, 'Panretinal photocoagulation', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A contact lens wearer develops pain, photophobia, and a circular epithelial defect with surrounding infiltrate. Cultures are pending.',
    'What is the most appropriate initial management emphasis?',
    'Suspected infectious keratitis in a contact lens wearer requires prompt antimicrobial therapy and lens discontinuation; steroids are avoided until bacterial causes are excluded or paired with appropriate antibiotics in specialist-guided scenarios. Patching reduces oxygen delivery and is avoided. Oral NSAIDs alone are insufficient.',
    cat_anterior,
    'student',
    'foundational'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Discontinue lenses and start broad-spectrum topical antibiotics', true),
    (q_id, 1, 'Start high-potency topical corticosteroids alone', false),
    (q_id, 2, 'Patch the eye and follow up in one week', false),
    (q_id, 3, 'Oral NSAIDs only', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'Herpes simplex dendritic keratitis is diagnosed on slit lamp examination.',
    'Which treatment is most appropriate?',
    'Oral or topical antiviral therapy is standard for epithelial HSV keratitis; corticosteroids without antivirals risk worsening viral replication. Antibiotics target bacteria. Cycloplegics may help symptoms but do not treat the infection.',
    cat_anterior,
    'resident',
    'intermediate'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Oral acyclovir or topical ganciclovir', true),
    (q_id, 1, 'Topical prednisolone alone', false),
    (q_id, 2, 'Broad-spectrum topical antibiotics', false),
    (q_id, 3, 'Topical atropine alone', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A 68-year-old with Fuchs endothelial dystrophy reports morning blur improving over hours; pachymetry shows thickened cornea.',
    'What is the pathophysiology most consistent with this pattern?',
    'Endothelial dysfunction leads to overnight corneal swelling that improves as evaporation reduces edema during the day. Tear deficiency alone does not explain pachymetric thickening. Epithelial basement membrane dystrophy primarily causes recurrent erosions and map-dot-fingerprint changes.',
    cat_anterior,
    'practicing',
    'advanced'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Compromised endothelial pump function with overnight stromal edema', true),
    (q_id, 1, 'Primary tear film hyperosmolarity without endothelial loss', false),
    (q_id, 2, 'Allergic conjunctivitis with chemosis', false),
    (q_id, 3, 'Elevated episcleral venous pressure', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'Bacterial conjunctivitis with mucopurulent discharge is suspected in an adult without contact lens use or systemic symptoms.',
    'What is the most evidence-aligned initial approach in many mild cases?',
    'Self-limited bacterial conjunctivitis often resolves without antibiotics; judicious observation can be appropriate in selected mild cases with safety-net instructions. Immediate IV antibiotics are excessive. Steroids alone risk bacterial worsening.',
    cat_anterior,
    'student',
    'foundational'::quiz_difficulty,
    'draft',
    author,
    NULL
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Patient education and observation with precautions in selected mild cases', true),
    (q_id, 1, 'Immediate intravenous vancomycin', false),
    (q_id, 2, 'High-dose oral steroids', false),
    (q_id, 3, 'Urgent anterior chamber washout', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A post-cataract patient has painless progressive vision with cells in the anterior chamber and fine keratic precipitates weeks after surgery.',
    'What is the leading diagnosis?',
    'Chronic postoperative inflammation without infection suggests chronic postoperative uveitis that may relate to retained lens material or low-grade immune reaction; endophthalmitis more often presents acutely with vitritis and pain. Acute angle closure would show high IOP and shallow chamber. Corneal graft rejection targets grafters.',
    cat_anterior,
    'resident',
    'intermediate'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Chronic postoperative uveitis or retained lens fragment consideration', true),
    (q_id, 1, 'Hyperacute angle closure without pain', false),
    (q_id, 2, 'Herpes zoster ophthalmicus without rash', false),
    (q_id, 3, 'Typical acute bacterial endophthalmitis presentation', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A diabetic patient has new scattered dot-blot hemorrhages and hard exudates near the macula without neovascularization on wide-field imaging.',
    'How is this severity category best described?',
    'Non-proliferative diabetic retinopathy severity uses features like microaneurysms, hemorrhages, and intraretinal microvascular abnormalities; proliferative disease requires neovascularization. Hypertensive retinopathy uses a different classification. Central serous lacks typical diabetic microvascular signs.',
    cat_posterior,
    'practicing',
    'intermediate'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Non-proliferative diabetic retinopathy', true),
    (q_id, 1, 'Proliferative diabetic retinopathy', false),
    (q_id, 2, 'Hypertensive choroidopathy stage IV', false),
    (q_id, 3, 'Central serous chorioretinopathy', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'Symptomatic vitreomacular traction with decreased vision and distortion shows elevated fovea on OCT without full-thickness hole.',
    'What intervention has guideline-supported use in selected cases?',
    'Ocriplasmin intravitreal injection can release vitreomacular traction in appropriate candidates; observation may be reasonable for mild cases. Laser does not relieve traction at the vitreomacular interface. Topical drops do not treat traction.',
    cat_posterior,
    'resident',
    'advanced'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Intravitreal ocriplasmin in selected patients', true),
    (q_id, 1, 'Panretinal photocoagulation to the macula', false),
    (q_id, 2, 'Topical NSAIDs only', false),
    (q_id, 3, 'Orbital radiation', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A senior describes painless progressive central blur; examination shows drusen and geographic atrophy in the macula.',
    'Which diagnosis is most likely?',
    'Age-related macular degeneration features drusen and atrophy or neovascularization; diabetic macular edema requires diabetes context and typically cystoid changes. Retinal detachment presents with flashes, floaters, or field defects. CRVO shows vascular occlusive signs.',
    cat_posterior,
    'student',
    'foundational'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Age-related macular degeneration', true),
    (q_id, 1, 'Rhegmatogenous retinal detachment without symptoms', false),
    (q_id, 2, 'Central retinal artery occlusion', false),
    (q_id, 3, 'Posterior vitreous detachment only', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'Rhegmatogenous retinal detachment is confirmed with a superotemporal break and macula-off status.',
    'What is the definitive surgical principle?',
    'Rhegmatogenous detachments are repaired by closing retinal breaks via scleral buckling, vitrectomy with gas or oil, or combined approaches; observation risks progression. Laser alone cannot appose a detached retina across subretinal fluid. Intravitreal anti-VEGF treats neovascular disease, not primary rhegma.',
    cat_posterior,
    'practicing',
    'intermediate'::quiz_difficulty,
    'draft',
    author,
    NULL
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Surgical repair to close retinal breaks and reattach the retina', true),
    (q_id, 1, 'High-dose oral steroids alone', false),
    (q_id, 2, 'Daily patching therapy', false),
    (q_id, 3, 'Intravitreal anti-VEGF monotherapy', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A branch retinal vein occlusion is noted with sector intraretinal hemorrhages along an arcade.',
    'What underlying vascular risk factor work-up is most appropriate alongside ophthalmic care?',
    'BRVO associates with systemic hypertension and dyslipidemia; evaluating blood pressure and lipids is standard. Giant cell arteritis is uncommon in typical BRVO scenarios in younger adults but age guides testing. Pure infectious etiology is not the default.',
    cat_posterior,
    'resident',
    'intermediate'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Blood pressure assessment and lipid evaluation', true),
    (q_id, 1, 'Immediate temporal artery biopsy in all patients', false),
    (q_id, 2, 'Lumbar puncture routinely', false),
    (q_id, 3, 'Empiric full-dose anticoagulation without evaluation', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'OCT of the macula shows intraretinal cystoid spaces with central thickening in a diabetic patient.',
    'What finding is most consistent with this OCT pattern?',
    'Diabetic macular edema manifests as retinal thickening and cystoid changes on OCT. Epiretinal membrane causes surface wrinkling. Full-thickness hole shows tissue absence through all layers. Outer retinal tubulation pattern differs.',
    cat_imaging,
    'student',
    'foundational'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Diabetic macular edema', true),
    (q_id, 1, 'Full-thickness macular hole', false),
    (q_id, 2, 'Geographic atrophy without fluid', false),
    (q_id, 3, 'Melanoma choroidal mass', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'Humphrey 24-2 shows a dense superior arcuate defect respecting the horizontal raphe in one eye.',
    'Where is the lesion most likely localized?',
    'Arcuate field defects correspond to retinal nerve fiber layer loss patterns often from optic nerve or RNFL pathology in glaucoma; homonymous defects localize post-chiasm. Macular disease causes central scotomas more than isolated arcuate patterns.',
    cat_imaging,
    'resident',
    'intermediate'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Anterior visual pathway at the optic nerve / RNFL level', true),
    (q_id, 1, 'Optic radiations in the parietal lobe alone', false),
    (q_id, 2, 'Occipital pole cortical lesion', false),
    (q_id, 3, 'Pre-chiasmal binocular cortical area', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'Fundus autofluorescence shows hypo-autofluorescence in geographic patches at the macula with surrounding hyper-autofluorescent margins.',
    'What process does this pattern commonly reflect?',
    'Geographic atrophy in AMD shows loss of RPE with hypo-autofluorescence and marginal stress patterns; active wet AMD typically shows fluid or hemorrhage on OCT rather than pure GA patterns alone. Melanocytoma has distinct pigmentation features.',
    cat_imaging,
    'practicing',
    'advanced'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'RPE atrophy with lipofuscin redistribution at margins', true),
    (q_id, 1, 'Acute vitreous hemorrhage layering', false),
    (q_id, 2, 'Fresh central retinal artery occlusion cherry-red spot only', false),
    (q_id, 3, 'Posterior vitreous detachment ring exclusively', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'B-scan ultrasonography shows a dome-shaped choroidal mass with acoustic hollowing and choroidal excavation.',
    'Which diagnosis should be highest on the differential?',
    'Choroidal melanoma often appears as a dome-shaped mass with characteristic ultrasound findings; choroidal hemangioma typically shows intrinsic hyperreflectivity without melanoma acoustic patterns. Posterior vitreous detachment is echogenic mobile membrane.',
    cat_imaging,
    'resident',
    'intermediate'::quiz_difficulty,
    'draft',
    author,
    NULL
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Choroidal melanoma', true),
    (q_id, 1, 'Simple rhegmatogenous retinal detachment membrane only', false),
    (q_id, 2, 'Optic nerve drusen', false),
    (q_id, 3, 'Phthisis bulbi calcification only', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'An ERG is ordered for a child with nyctalopia and narrowed visual fields; fundus shows waxy disc pallor and arteriolar attenuation.',
    'What pattern does full-field ERG classically show in advanced retinitis pigmentosa?',
    'Rod-driven responses attenuate early in RP, producing reduced scotopic responses before photopic loss in many cases. Normal ERG would not fit advanced disease. Pure macular pattern ERG changes would not explain peripheral fields.',
    cat_imaging,
    'student',
    'foundational'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Markedly reduced scotopic responses with progression to reduced photopic signals', true),
    (q_id, 1, 'Supranormal photopic responses only', false),
    (q_id, 2, 'Isolated delayed blue cone pathway without rod involvement', false),
    (q_id, 3, 'Flat ERG only in light-adapted eye while dark-adapted is normal', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A patient has acute binocular horizontal diplopia worse at distance and lateral gaze limitation with pupil sparing.',
    'Which cranial nerve palsy is most consistent?',
    'Abducens nerve palsy limits abduction and may cause diplopia worse for distance; pupil involvement suggests compressive third nerve pathology rather than isolated sixth nerve microvascular palsy patterns in adults.',
    cat_neuro,
    'practicing',
    'advanced'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Sixth cranial nerve palsy', true),
    (q_id, 1, 'Third cranial nerve palsy with blown pupil', false),
    (q_id, 2, 'Fourth cranial nerve palsy isolated hypertropia pattern only', false),
    (q_id, 3, 'Facial nerve palsy', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'Optic disc swelling is bilateral with elevated intracranial pressure on imaging; vision is preserved early.',
    'What term describes optic nerve appearance?',
    'Papilledema specifically denotes optic disc swelling secondary to raised intracranial pressure; optic neuritis often affects vision early and may be unilateral. Pseudopapilledema reflects anomalous discs without true edema.',
    cat_neuro,
    'resident',
    'intermediate'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Papilledema', true),
    (q_id, 1, 'Typical acute anterior ischemic optic neuropathy', false),
    (q_id, 2, 'Optic nerve head drusen', false),
    (q_id, 3, 'Glaucomatous cupping', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'A congruent homonymous hemianopia respects the vertical midline without macular sparing.',
    'Where is the lesion most likely?',
    'Retrochiasmal lesions produce congruent homonymous defects; optic tract lesions may show relative afferent pupillary defects and incongruence patterns depending on location. Chiasm lesions cause bitemporal patterns.',
    cat_neuro,
    'student',
    'foundational'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Optic radiations or occipital cortex contralateral to the field loss', true),
    (q_id, 1, 'Optic chiasm midline only', false),
    (q_id, 2, 'Unilateral optic nerve anterior to chiasm', false),
    (q_id, 3, 'Pre-chiasmal nasal retina alone', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'An elderly patient with jaw claudication, temporal headache, and elevated ESR presents with acute vision loss from anterior ischemic optic neuropathy.',
    'What is the most urgent systemic therapy priority?',
    'Giant cell arteritis requires prompt corticosteroids to prevent fellow-eye involvement; observation risks catastrophic bilateral blindness. IOP-lowering treats glaucoma, not arteritic AION.',
    cat_neuro,
    'practicing',
    'intermediate'::quiz_difficulty,
    'published',
    author,
    now()
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'High-dose systemic corticosteroids promptly', true),
    (q_id, 1, 'Observation with aspirin alone', false),
    (q_id, 2, 'Immediate trabeculectomy', false),
    (q_id, 3, 'Topical steroid drops only', false);

  INSERT INTO quiz_questions (vignette, question_text, explanation, category_id, target_audience, difficulty, status, author_id, published_at)
  VALUES (
    'Myasthenia gravis is suspected with fatigable diplopia and ptosis with normal pupils.',
    'Which test is most specific for confirming ocular myasthenia in many centers?',
    'Anti-acetylcholine receptor and MuSK antibodies support diagnosis; single-fiber EMG is highly sensitive in selected centers. Ice test can be supportive but is not the definitive confirmatory laboratory standard alone. Visual field testing does not diagnose MG.',
    cat_neuro,
    'resident',
    'intermediate'::quiz_difficulty,
    'draft',
    author,
    NULL
  ) RETURNING id INTO q_id;

  INSERT INTO quiz_question_choices (question_id, position, text, is_correct) VALUES
    (q_id, 0, 'Serologic testing for AChR/MuSK antibodies with adjunct electrophysiology as indicated', true),
    (q_id, 1, 'Standard automated perimetry alone', false),
    (q_id, 2, 'Routine orbital MRI without clinical suspicion of structural lesion', false),
    (q_id, 3, 'Schirmer testing', false);

END $$;
