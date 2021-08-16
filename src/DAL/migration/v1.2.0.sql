-- v1.1.0 db creation script --
-- please note that the update date is updated by typeOrm and not by trigger --

CREATE TYPE public."operation_status_enum" AS ENUM
    ('inProgress', 'triggered', 'failed');

CREATE TABLE public."layer_history"
(
  "directory" character varying(300) NOT NULL,
  "layerId" character varying(300),
  "version" character varying(30),
  "status" "operation_status_enum" NOT NULL DEFAULT 'inProgress'::"operation_status_enum",
  "createdOn" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedOn" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "layer_history_pkey" PRIMARY KEY (directory)
);

CREATE TABLE public."setting"
(
  "key" character varying(300) NOT NULL,
  "value" character varying(300) NOT NULL,
  CONSTRAINT "setting_pkey" PRIMARY KEY (key)
);
