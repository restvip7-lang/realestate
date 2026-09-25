import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ru', 'en', 'tr');
  CREATE TYPE "public"."enum_properties_features" AS ENUM('Открытый бассейн', 'Закрытый бассейн', 'Детский бассейн', 'Аквапарк', 'Фитнес-зал', 'Финская сауна', 'Турецкий хамам', 'Паровая баня', 'Джакузи', 'Массажный кабинет', 'Спа-центр', 'Теннисный корт', 'Баскетбольная площадка', 'Волейбольная площадка', 'Настольный теннис', 'Бильярд', 'Боулинг', 'Кинотеатр', 'Игровая комната', 'Детская площадка', 'Мини-клуб', 'Кафе / ресторан', 'Бар у бассейна', 'Маркет', 'Парикмахерская', 'Конференц-зал', 'Зелёная территория', 'Прогулочные дорожки', 'Зоны барбекю', 'Беседки', 'Собственный пляж', 'Шаттл до пляжа', 'Охрана 24/7', 'Видеонаблюдение', 'Консьерж', 'Генератор', 'Крытая парковка', 'Открытая парковка', 'Лифт', 'Спутниковое ТВ', 'Wi-Fi на территории', 'Тёплый пол', 'Кондиционеры', 'Встроенная кухня', 'Солнечный водонагреватель');
  CREATE TYPE "public"."enum_properties_labels" AS ENUM('week', 'hot', 'rec', 'excl');
  CREATE TYPE "public"."enum_properties_deal" AS ENUM('sale', 'rent');
  CREATE TYPE "public"."enum_properties_type" AS ENUM('apartment', 'penthouse', 'villa', 'duplex', 'land', 'commercial');
  CREATE TYPE "public"."enum_properties_rooms" AS ENUM('1+0', '1+1', '2+1', '3+1', '3+2', '4+1', '4+2', '5+1', '6+1');
  CREATE TYPE "public"."enum_properties_view" AS ENUM('city', 'sea', 'mountain', 'castle');
  CREATE TYPE "public"."enum_properties_furnished" AS ENUM('no', 'yes', 'partial');
  CREATE TYPE "public"."enum_properties_condition" AS ENUM('resale', 'new', 'construction');
  CREATE TYPE "public"."enum_properties_source" AS ENUM('developer', 'owner', 'agency');
  CREATE TYPE "public"."enum_properties_currency" AS ENUM('EUR', 'USD', 'GBP', 'TRY');
  CREATE TYPE "public"."enum_properties_rent_period" AS ENUM('long', 'short', 'season');
  CREATE TYPE "public"."enum_properties_status" AS ENUM('published', 'draft', 'reserved', 'sold', 'rented', 'hidden');
  CREATE TYPE "public"."enum_posts_kind" AS ENUM('article', 'news');
  CREATE TYPE "public"."enum_posts_category" AS ENUM('market', 'laws', 'residence', 'life', 'rates', 'agency');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_kind" AS ENUM('article', 'news');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('market', 'laws', 'residence', 'life', 'rates', 'agency');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('ru', 'en', 'tr');
  CREATE TYPE "public"."enum_team_kind" AS ENUM('founder', 'expert', 'lawyer');
  CREATE TYPE "public"."enum_reviews_service" AS ENUM('buy', 'rent', 'docs', 'sell');
  CREATE TYPE "public"."enum_leads_contact_via" AS ENUM('whatsapp', 'telegram', 'phone', 'email');
  CREATE TYPE "public"."enum_leads_form" AS ENUM('pick', 'viewing', 'question', 'cheaper', 'costs', 'consult', 'sell');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'work', 'viewing', 'deal', 'lost', 'spam');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'agent');
  CREATE TYPE "public"."enum_company_social_network" AS ENUM('instagram', 'youtube', 'facebook', 'vk', 'tiktok', 'telegram');
  CREATE TABLE "properties_features" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_properties_features",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "properties_labels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_properties_labels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "properties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"deal" "enum_properties_deal" DEFAULT 'sale' NOT NULL,
  	"type" "enum_properties_type" NOT NULL,
  	"district_id" integer NOT NULL,
  	"complex" varchar,
  	"rooms" "enum_properties_rooms",
  	"area" numeric,
  	"floor" numeric,
  	"floors" numeric,
  	"year" numeric,
  	"sea" numeric,
  	"airport" numeric,
  	"view" "enum_properties_view" DEFAULT 'city',
  	"furnished" "enum_properties_furnished" DEFAULT 'no',
  	"condition" "enum_properties_condition" DEFAULT 'resale',
  	"source" "enum_properties_source" DEFAULT 'developer',
  	"price_original" numeric,
  	"currency" "enum_properties_currency" DEFAULT 'EUR',
  	"price_checked_at" timestamp(3) with time zone,
  	"price" numeric,
  	"installment_months" numeric,
  	"installment_down" numeric,
  	"bargain" boolean,
  	"citizenship" boolean,
  	"residence" boolean,
  	"rental_income" boolean,
  	"rent_period" "enum_properties_rent_period" DEFAULT 'long',
  	"rent_price_per_day" numeric,
  	"rent_deposit" numeric,
  	"rent_min_term" numeric,
  	"rent_advance" numeric,
  	"rent_available_from" timestamp(3) with time zone,
  	"rent_utilities" boolean,
  	"rent_pets" boolean,
  	"video" varchar,
  	"tour" varchar,
  	"lat" numeric,
  	"lng" numeric,
  	"address" varchar,
  	"status" "enum_properties_status" DEFAULT 'draft' NOT NULL,
  	"agent_id" integer,
  	"slug" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "properties_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "properties_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "districts_pros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "districts_cons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "districts_infra" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "districts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"inland" boolean,
  	"image_id" integer,
  	"price_per_m2" numeric,
  	"price_per_m2_date" timestamp(3) with time zone,
  	"coast_km" numeric,
  	"scores_life" numeric,
  	"scores_rent" numeric,
  	"scores_beach" numeric,
  	"scores_infra" numeric,
  	"scores_quiet" numeric,
  	"lat" numeric,
  	"lng" numeric,
  	"schema_x" numeric,
  	"schema_y" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "districts_locales" (
  	"name" varchar NOT NULL,
  	"name_in" varchar,
  	"about" varchar,
  	"lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_posts_kind" DEFAULT 'article',
  	"category" "enum_posts_category",
  	"cover_id" integer,
  	"source" varchar,
  	"reviewed_at" timestamp(3) with time zone,
  	"published_at" timestamp(3) with time zone,
  	"author_id" integer,
  	"pinned" boolean,
  	"slug" varchar,
  	"reading_mins" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"lead" varchar,
  	"body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"districts_id" integer,
  	"properties_id" integer
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_kind" "enum__posts_v_version_kind" DEFAULT 'article',
  	"version_category" "enum__posts_v_version_category",
  	"version_cover_id" integer,
  	"version_source" varchar,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_published_at" timestamp(3) with time zone,
  	"version_author_id" integer,
  	"version_pinned" boolean,
  	"version_slug" varchar,
  	"version_reading_mins" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_lead" varchar,
  	"version_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"districts_id" integer,
  	"properties_id" integer
  );
  
  CREATE TABLE "team_help" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kind" "enum_team_kind" DEFAULT 'expert' NOT NULL,
  	"langs" varchar,
  	"exp" numeric,
  	"photo_id" integer,
  	"phone" varchar,
  	"whatsapp" varchar,
  	"telegram" varchar,
  	"email" varchar,
  	"slug" varchar,
  	"order" numeric DEFAULT 100,
  	"hidden" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "team_locales" (
  	"role" varchar NOT NULL,
  	"spec" varchar,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "team_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"districts_id" integer
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"who" varchar NOT NULL,
  	"country" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"rating" numeric DEFAULT 5 NOT NULL,
  	"service" "enum_reviews_service" DEFAULT 'buy',
  	"expert_id" integer,
  	"text" varchar NOT NULL,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"contact_via" "enum_leads_contact_via",
  	"form" "enum_leads_form",
  	"locale" varchar,
  	"message" varchar,
  	"property_id" integer,
  	"page" varchar,
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"utm_term" varchar,
  	"utm_content" varchar,
  	"utm_gclid" varchar,
  	"consent" boolean,
  	"status" "enum_leads_status" DEFAULT 'new',
  	"agent_id" integer,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"member_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"properties_id" integer,
  	"districts_id" integer,
  	"posts_id" integer,
  	"team_id" integer,
  	"reviews_id" integer,
  	"leads_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "company_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"network" "enum_company_social_network",
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "company" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar NOT NULL,
  	"whatsapp" varchar NOT NULL,
  	"telegram" varchar,
  	"email" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"showroom" varchar,
  	"lat" numeric,
  	"lng" numeric,
  	"legal_name" varchar,
  	"legal_license" varchar,
  	"legal_verbis" varchar,
  	"legal_tax_office" varchar,
  	"legal_tax_no" varchar,
  	"is_demo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "company_locales" (
  	"hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "rates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"usd" numeric NOT NULL,
  	"try" numeric NOT NULL,
  	"rub" numeric NOT NULL,
  	"kzt" numeric NOT NULL,
  	"gbp" numeric NOT NULL,
  	"checked_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "team_page_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "team_page_stats_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "team_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "team_page_locales" (
  	"title" varchar NOT NULL,
  	"lead" varchar,
  	"quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "properties_features" ADD CONSTRAINT "properties_features_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_labels" ADD CONSTRAINT "properties_labels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_team_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_locales" ADD CONSTRAINT "properties_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "districts_pros" ADD CONSTRAINT "districts_pros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "districts_cons" ADD CONSTRAINT "districts_cons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "districts_infra" ADD CONSTRAINT "districts_infra_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "districts" ADD CONSTRAINT "districts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "districts_locales" ADD CONSTRAINT "districts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_team_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_texts" ADD CONSTRAINT "posts_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_districts_fk" FOREIGN KEY ("districts_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_team_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_texts" ADD CONSTRAINT "_posts_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_districts_fk" FOREIGN KEY ("districts_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_help" ADD CONSTRAINT "team_help_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_locales" ADD CONSTRAINT "team_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_rels" ADD CONSTRAINT "team_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_rels" ADD CONSTRAINT "team_rels_districts_fk" FOREIGN KEY ("districts_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_expert_id_team_id_fk" FOREIGN KEY ("expert_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_agent_id_team_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_member_id_team_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_districts_fk" FOREIGN KEY ("districts_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_social" ADD CONSTRAINT "company_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_locales" ADD CONSTRAINT "company_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_page_stats" ADD CONSTRAINT "team_page_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_page_stats_locales" ADD CONSTRAINT "team_page_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_page_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_page_locales" ADD CONSTRAINT "team_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_features_order_idx" ON "properties_features" USING btree ("order");
  CREATE INDEX "properties_features_parent_idx" ON "properties_features" USING btree ("parent_id");
  CREATE INDEX "properties_labels_order_idx" ON "properties_labels" USING btree ("order");
  CREATE INDEX "properties_labels_parent_idx" ON "properties_labels" USING btree ("parent_id");
  CREATE INDEX "properties_district_idx" ON "properties" USING btree ("district_id");
  CREATE INDEX "properties_price_idx" ON "properties" USING btree ("price");
  CREATE INDEX "properties_status_idx" ON "properties" USING btree ("status");
  CREATE INDEX "properties_agent_idx" ON "properties" USING btree ("agent_id");
  CREATE INDEX "properties_slug_idx" ON "properties" USING btree ("slug");
  CREATE INDEX "properties_updated_at_idx" ON "properties" USING btree ("updated_at");
  CREATE INDEX "properties_created_at_idx" ON "properties" USING btree ("created_at");
  CREATE UNIQUE INDEX "properties_locales_locale_parent_id_unique" ON "properties_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "properties_rels_order_idx" ON "properties_rels" USING btree ("order");
  CREATE INDEX "properties_rels_parent_idx" ON "properties_rels" USING btree ("parent_id");
  CREATE INDEX "properties_rels_path_idx" ON "properties_rels" USING btree ("path");
  CREATE INDEX "properties_rels_media_id_idx" ON "properties_rels" USING btree ("media_id");
  CREATE INDEX "districts_pros_order_idx" ON "districts_pros" USING btree ("_order");
  CREATE INDEX "districts_pros_parent_id_idx" ON "districts_pros" USING btree ("_parent_id");
  CREATE INDEX "districts_pros_locale_idx" ON "districts_pros" USING btree ("_locale");
  CREATE INDEX "districts_cons_order_idx" ON "districts_cons" USING btree ("_order");
  CREATE INDEX "districts_cons_parent_id_idx" ON "districts_cons" USING btree ("_parent_id");
  CREATE INDEX "districts_cons_locale_idx" ON "districts_cons" USING btree ("_locale");
  CREATE INDEX "districts_infra_order_idx" ON "districts_infra" USING btree ("_order");
  CREATE INDEX "districts_infra_parent_id_idx" ON "districts_infra" USING btree ("_parent_id");
  CREATE INDEX "districts_infra_locale_idx" ON "districts_infra" USING btree ("_locale");
  CREATE UNIQUE INDEX "districts_slug_idx" ON "districts" USING btree ("slug");
  CREATE INDEX "districts_image_idx" ON "districts" USING btree ("image_id");
  CREATE INDEX "districts_updated_at_idx" ON "districts" USING btree ("updated_at");
  CREATE INDEX "districts_created_at_idx" ON "districts" USING btree ("created_at");
  CREATE UNIQUE INDEX "districts_locales_locale_parent_id_unique" ON "districts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_cover_idx" ON "posts" USING btree ("cover_id");
  CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_texts_order_parent" ON "posts_texts" USING btree ("order","parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_districts_id_idx" ON "posts_rels" USING btree ("districts_id");
  CREATE INDEX "posts_rels_properties_id_idx" ON "posts_rels" USING btree ("properties_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_cover_idx" ON "_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_posts_v_version_version_published_at_idx" ON "_posts_v" USING btree ("version_published_at");
  CREATE INDEX "_posts_v_version_version_author_idx" ON "_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_texts_order_parent" ON "_posts_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_districts_id_idx" ON "_posts_v_rels" USING btree ("districts_id");
  CREATE INDEX "_posts_v_rels_properties_id_idx" ON "_posts_v_rels" USING btree ("properties_id");
  CREATE INDEX "team_help_order_idx" ON "team_help" USING btree ("_order");
  CREATE INDEX "team_help_parent_id_idx" ON "team_help" USING btree ("_parent_id");
  CREATE INDEX "team_help_locale_idx" ON "team_help" USING btree ("_locale");
  CREATE INDEX "team_photo_idx" ON "team" USING btree ("photo_id");
  CREATE UNIQUE INDEX "team_slug_idx" ON "team" USING btree ("slug");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE UNIQUE INDEX "team_locales_locale_parent_id_unique" ON "team_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "team_rels_order_idx" ON "team_rels" USING btree ("order");
  CREATE INDEX "team_rels_parent_idx" ON "team_rels" USING btree ("parent_id");
  CREATE INDEX "team_rels_path_idx" ON "team_rels" USING btree ("path");
  CREATE INDEX "team_rels_districts_id_idx" ON "team_rels" USING btree ("districts_id");
  CREATE INDEX "reviews_expert_idx" ON "reviews" USING btree ("expert_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "leads_property_idx" ON "leads" USING btree ("property_id");
  CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");
  CREATE INDEX "leads_agent_idx" ON "leads" USING btree ("agent_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_member_idx" ON "users" USING btree ("member_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_properties_id_idx" ON "payload_locked_documents_rels" USING btree ("properties_id");
  CREATE INDEX "payload_locked_documents_rels_districts_id_idx" ON "payload_locked_documents_rels" USING btree ("districts_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "company_social_order_idx" ON "company_social" USING btree ("_order");
  CREATE INDEX "company_social_parent_id_idx" ON "company_social" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "company_locales_locale_parent_id_unique" ON "company_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "team_page_stats_order_idx" ON "team_page_stats" USING btree ("_order");
  CREATE INDEX "team_page_stats_parent_id_idx" ON "team_page_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "team_page_stats_locales_locale_parent_id_unique" ON "team_page_stats_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "team_page_locales_locale_parent_id_unique" ON "team_page_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "properties_features" CASCADE;
  DROP TABLE "properties_labels" CASCADE;
  DROP TABLE "properties" CASCADE;
  DROP TABLE "properties_locales" CASCADE;
  DROP TABLE "properties_rels" CASCADE;
  DROP TABLE "districts_pros" CASCADE;
  DROP TABLE "districts_cons" CASCADE;
  DROP TABLE "districts_infra" CASCADE;
  DROP TABLE "districts" CASCADE;
  DROP TABLE "districts_locales" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "posts_texts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "_posts_v_texts" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "team_help" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "team_locales" CASCADE;
  DROP TABLE "team_rels" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "company_social" CASCADE;
  DROP TABLE "company" CASCADE;
  DROP TABLE "company_locales" CASCADE;
  DROP TABLE "rates" CASCADE;
  DROP TABLE "team_page_stats" CASCADE;
  DROP TABLE "team_page_stats_locales" CASCADE;
  DROP TABLE "team_page" CASCADE;
  DROP TABLE "team_page_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_properties_features";
  DROP TYPE "public"."enum_properties_labels";
  DROP TYPE "public"."enum_properties_deal";
  DROP TYPE "public"."enum_properties_type";
  DROP TYPE "public"."enum_properties_rooms";
  DROP TYPE "public"."enum_properties_view";
  DROP TYPE "public"."enum_properties_furnished";
  DROP TYPE "public"."enum_properties_condition";
  DROP TYPE "public"."enum_properties_source";
  DROP TYPE "public"."enum_properties_currency";
  DROP TYPE "public"."enum_properties_rent_period";
  DROP TYPE "public"."enum_properties_status";
  DROP TYPE "public"."enum_posts_kind";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_kind";
  DROP TYPE "public"."enum__posts_v_version_category";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_team_kind";
  DROP TYPE "public"."enum_reviews_service";
  DROP TYPE "public"."enum_leads_contact_via";
  DROP TYPE "public"."enum_leads_form";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_company_social_network";`)
}
