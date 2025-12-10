--
-- PostgreSQL database dump
--

-- \restrict g9Z0nksASjVlIQWr3igRxKh1lANh2rkGUyx1eYEKYOgQlhzBhatTuqM0fhX0ERd

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asignacion_personal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignacion_personal (
    id_asignacion integer NOT NULL,
    id_proyecto integer NOT NULL,
    id_personal integer NOT NULL,
    horas_trabajadas numeric(7,2) NOT NULL,
    fecha_registro date NOT NULL
);


ALTER TABLE public.asignacion_personal OWNER TO postgres;

--
-- Name: asignacion_personal_id_asignacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asignacion_personal_id_asignacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asignacion_personal_id_asignacion_seq OWNER TO postgres;

--
-- Name: asignacion_personal_id_asignacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asignacion_personal_id_asignacion_seq OWNED BY public.asignacion_personal.id_asignacion;


--
-- Name: categorias_gasto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias_gasto (
    id_categoria_gasto integer NOT NULL,
    nombre_categoria character varying(50) NOT NULL
);


ALTER TABLE public.categorias_gasto OWNER TO postgres;

--
-- Name: categorias_gasto_id_categoria_gasto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_gasto_id_categoria_gasto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_gasto_id_categoria_gasto_seq OWNER TO postgres;

--
-- Name: categorias_gasto_id_categoria_gasto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_gasto_id_categoria_gasto_seq OWNED BY public.categorias_gasto.id_categoria_gasto;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id_cliente integer NOT NULL,
    rif_cliente character varying(10),
    nombre_cliente character varying(100) NOT NULL,
    email_cliente character varying(100),
    telefono_cliente character varying(30)
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_id_cliente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_cliente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_cliente_seq OWNER TO postgres;

--
-- Name: clientes_id_cliente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_cliente_seq OWNED BY public.clientes.id_cliente;


--
-- Name: contratos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contratos (
    id_contrato integer NOT NULL,
    id_proyecto integer NOT NULL,
    id_cliente integer,
    fecha_firma date NOT NULL,
    monto_contrato numeric(14,2) NOT NULL,
    descripcion_servicios text
);


ALTER TABLE public.contratos OWNER TO postgres;

--
-- Name: contratos_id_contrato_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contratos_id_contrato_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contratos_id_contrato_seq OWNER TO postgres;

--
-- Name: contratos_id_contrato_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contratos_id_contrato_seq OWNED BY public.contratos.id_contrato;


--
-- Name: entregables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entregables (
    id_entregable integer NOT NULL,
    id_proyecto integer NOT NULL,
    descripcion character varying(255) NOT NULL,
    fecha_entrega_estimada date,
    id_estado_entregable integer,
    link_entrega character varying(255)
);


ALTER TABLE public.entregables OWNER TO postgres;

--
-- Name: entregables_id_entregable_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entregables_id_entregable_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.entregables_id_entregable_seq OWNER TO postgres;

--
-- Name: entregables_id_entregable_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entregables_id_entregable_seq OWNED BY public.entregables.id_entregable;


--
-- Name: estados_entregable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estados_entregable (
    id_estado_entregable integer NOT NULL,
    nombre_estado character varying(50) NOT NULL
);


ALTER TABLE public.estados_entregable OWNER TO postgres;

--
-- Name: estados_entregable_id_estado_entregable_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estados_entregable_id_estado_entregable_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estados_entregable_id_estado_entregable_seq OWNER TO postgres;

--
-- Name: estados_entregable_id_estado_entregable_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estados_entregable_id_estado_entregable_seq OWNED BY public.estados_entregable.id_estado_entregable;


--
-- Name: estados_pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estados_pago (
    id_estado_pago integer NOT NULL,
    nombre_estado character varying(50) NOT NULL
);


ALTER TABLE public.estados_pago OWNER TO postgres;

--
-- Name: estados_pago_id_estado_pago_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estados_pago_id_estado_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estados_pago_id_estado_pago_seq OWNER TO postgres;

--
-- Name: estados_pago_id_estado_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estados_pago_id_estado_pago_seq OWNED BY public.estados_pago.id_estado_pago;


--
-- Name: estados_proyecto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estados_proyecto (
    id_estado_proyecto integer NOT NULL,
    nombre_estado character varying(50) NOT NULL
);


ALTER TABLE public.estados_proyecto OWNER TO postgres;

--
-- Name: estados_proyecto_id_estado_proyecto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estados_proyecto_id_estado_proyecto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estados_proyecto_id_estado_proyecto_seq OWNER TO postgres;

--
-- Name: estados_proyecto_id_estado_proyecto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estados_proyecto_id_estado_proyecto_seq OWNED BY public.estados_proyecto.id_estado_proyecto;


--
-- Name: facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas (
    id_factura integer NOT NULL,
    id_contrato integer,
    fecha_emision date NOT NULL,
    monto_total numeric(14,2) NOT NULL,
    id_estado_pago integer NOT NULL
);


ALTER TABLE public.facturas OWNER TO postgres;

--
-- Name: facturas_id_factura_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facturas_id_factura_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facturas_id_factura_seq OWNER TO postgres;

--
-- Name: facturas_id_factura_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facturas_id_factura_seq OWNED BY public.facturas.id_factura;


--
-- Name: gastos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gastos (
    id_gasto integer NOT NULL,
    descripcion_gasto character varying(255) NOT NULL,
    id_categoria_gasto integer,
    monto_gasto numeric(14,2) NOT NULL,
    fecha_gasto date NOT NULL,
    id_contrato integer
);


ALTER TABLE public.gastos OWNER TO postgres;

--
-- Name: gastos_id_gasto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gastos_id_gasto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gastos_id_gasto_seq OWNER TO postgres;

--
-- Name: gastos_id_gasto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gastos_id_gasto_seq OWNED BY public.gastos.id_gasto;


--
-- Name: gestor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gestor (
    id_gestor integer NOT NULL,
    nombre_gestor character varying(50),
    usuario_gestor character varying(20) NOT NULL,
    pass_gestor character varying(60) NOT NULL
);


ALTER TABLE public.gestor OWNER TO postgres;

--
-- Name: gestor_id_gestor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gestor_id_gestor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gestor_id_gestor_seq OWNER TO postgres;

--
-- Name: gestor_id_gestor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gestor_id_gestor_seq OWNED BY public.gestor.id_gestor;


--
-- Name: locaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locaciones (
    id_locacion integer NOT NULL,
    nombre_locacion character varying(100) NOT NULL,
    direccion character varying(200),
    descripcion_locacion character varying(255)
);


ALTER TABLE public.locaciones OWNER TO postgres;

--
-- Name: locaciones_id_locacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.locaciones_id_locacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.locaciones_id_locacion_seq OWNER TO postgres;

--
-- Name: locaciones_id_locacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.locaciones_id_locacion_seq OWNED BY public.locaciones.id_locacion;


--
-- Name: pagos_personal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos_personal (
    id_pago integer NOT NULL,
    id_personal integer NOT NULL,
    id_asignacion integer,
    monto_pagado numeric(14,2) NOT NULL,
    fecha_pago date NOT NULL,
    motivo_pago character varying(255)
);


ALTER TABLE public.pagos_personal OWNER TO postgres;

--
-- Name: pagos_personal_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagos_personal_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pagos_personal_id_pago_seq OWNER TO postgres;

--
-- Name: pagos_personal_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagos_personal_id_pago_seq OWNED BY public.pagos_personal.id_pago;


--
-- Name: personal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal (
    id_personal integer NOT NULL,
    nombre_personal character varying(100) NOT NULL,
    cedula_personal character varying(9) NOT NULL,
    id_rol integer,
    salario numeric(12,2) NOT NULL,
    email_personal character varying(100),
    telefono character varying(30)
);


ALTER TABLE public.personal OWNER TO postgres;

--
-- Name: personal_id_personal_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_id_personal_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_id_personal_seq OWNER TO postgres;

--
-- Name: personal_id_personal_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_id_personal_seq OWNED BY public.personal.id_personal;


--
-- Name: proyecto_locaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proyecto_locaciones (
    id_proyecto integer NOT NULL,
    id_locacion integer NOT NULL
);


ALTER TABLE public.proyecto_locaciones OWNER TO postgres;

--
-- Name: proyectos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proyectos (
    id_proyecto integer NOT NULL,
    nombre_proyecto character varying(100) NOT NULL,
    id_tipo_proyecto integer,
    id_estado_proyecto integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin_estimada date,
    presupuesto numeric(14,2) NOT NULL
);


ALTER TABLE public.proyectos OWNER TO postgres;

--
-- Name: proyectos_id_proyecto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proyectos_id_proyecto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proyectos_id_proyecto_seq OWNER TO postgres;

--
-- Name: proyectos_id_proyecto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proyectos_id_proyecto_seq OWNED BY public.proyectos.id_proyecto;


--
-- Name: recurso_tecnico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recurso_tecnico (
    id_recurso integer NOT NULL,
    nombre_equipo character varying(150) NOT NULL,
    id_tipo_recurso integer
);


ALTER TABLE public.recurso_tecnico OWNER TO postgres;

--
-- Name: recurso_tecnico_id_recurso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recurso_tecnico_id_recurso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recurso_tecnico_id_recurso_seq OWNER TO postgres;

--
-- Name: recurso_tecnico_id_recurso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recurso_tecnico_id_recurso_seq OWNED BY public.recurso_tecnico.id_recurso;


--
-- Name: roles_personal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles_personal (
    id_rol integer NOT NULL,
    nombre_rol character varying(50) NOT NULL
);


ALTER TABLE public.roles_personal OWNER TO postgres;

--
-- Name: roles_personal_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_personal_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_personal_id_rol_seq OWNER TO postgres;

--
-- Name: roles_personal_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_personal_id_rol_seq OWNED BY public.roles_personal.id_rol;


--
-- Name: tipos_proyecto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_proyecto (
    id_tipo_proyecto integer NOT NULL,
    nombre_tipo character varying(50) NOT NULL
);


ALTER TABLE public.tipos_proyecto OWNER TO postgres;

--
-- Name: tipos_proyecto_id_tipo_proyecto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipos_proyecto_id_tipo_proyecto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_proyecto_id_tipo_proyecto_seq OWNER TO postgres;

--
-- Name: tipos_proyecto_id_tipo_proyecto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_proyecto_id_tipo_proyecto_seq OWNED BY public.tipos_proyecto.id_tipo_proyecto;


--
-- Name: tipos_recurso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_recurso (
    id_tipo_recurso integer NOT NULL,
    nombre_tipo character varying(50) NOT NULL
);


ALTER TABLE public.tipos_recurso OWNER TO postgres;

--
-- Name: tipos_recurso_id_tipo_recurso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipos_recurso_id_tipo_recurso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_recurso_id_tipo_recurso_seq OWNER TO postgres;

--
-- Name: tipos_recurso_id_tipo_recurso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_recurso_id_tipo_recurso_seq OWNED BY public.tipos_recurso.id_tipo_recurso;


--
-- Name: uso_recurso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.uso_recurso (
    id_uso integer NOT NULL,
    id_recurso integer NOT NULL,
    id_proyecto integer NOT NULL,
    fecha_inicio_uso timestamp without time zone NOT NULL,
    fecha_fin_uso timestamp without time zone
);


ALTER TABLE public.uso_recurso OWNER TO postgres;

--
-- Name: uso_recurso_id_uso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.uso_recurso_id_uso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.uso_recurso_id_uso_seq OWNER TO postgres;

--
-- Name: uso_recurso_id_uso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.uso_recurso_id_uso_seq OWNED BY public.uso_recurso.id_uso;


--
-- Name: asignacion_personal id_asignacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_personal ALTER COLUMN id_asignacion SET DEFAULT nextval('public.asignacion_personal_id_asignacion_seq'::regclass);


--
-- Name: categorias_gasto id_categoria_gasto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_gasto ALTER COLUMN id_categoria_gasto SET DEFAULT nextval('public.categorias_gasto_id_categoria_gasto_seq'::regclass);


--
-- Name: clientes id_cliente; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id_cliente SET DEFAULT nextval('public.clientes_id_cliente_seq'::regclass);


--
-- Name: contratos id_contrato; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos ALTER COLUMN id_contrato SET DEFAULT nextval('public.contratos_id_contrato_seq'::regclass);


--
-- Name: entregables id_entregable; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entregables ALTER COLUMN id_entregable SET DEFAULT nextval('public.entregables_id_entregable_seq'::regclass);


--
-- Name: estados_entregable id_estado_entregable; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_entregable ALTER COLUMN id_estado_entregable SET DEFAULT nextval('public.estados_entregable_id_estado_entregable_seq'::regclass);


--
-- Name: estados_pago id_estado_pago; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_pago ALTER COLUMN id_estado_pago SET DEFAULT nextval('public.estados_pago_id_estado_pago_seq'::regclass);


--
-- Name: estados_proyecto id_estado_proyecto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_proyecto ALTER COLUMN id_estado_proyecto SET DEFAULT nextval('public.estados_proyecto_id_estado_proyecto_seq'::regclass);


--
-- Name: facturas id_factura; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas ALTER COLUMN id_factura SET DEFAULT nextval('public.facturas_id_factura_seq'::regclass);


--
-- Name: gastos id_gasto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos ALTER COLUMN id_gasto SET DEFAULT nextval('public.gastos_id_gasto_seq'::regclass);


--
-- Name: gestor id_gestor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestor ALTER COLUMN id_gestor SET DEFAULT nextval('public.gestor_id_gestor_seq'::regclass);


--
-- Name: locaciones id_locacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locaciones ALTER COLUMN id_locacion SET DEFAULT nextval('public.locaciones_id_locacion_seq'::regclass);


--
-- Name: pagos_personal id_pago; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_personal ALTER COLUMN id_pago SET DEFAULT nextval('public.pagos_personal_id_pago_seq'::regclass);


--
-- Name: personal id_personal; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal ALTER COLUMN id_personal SET DEFAULT nextval('public.personal_id_personal_seq'::regclass);


--
-- Name: proyectos id_proyecto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos ALTER COLUMN id_proyecto SET DEFAULT nextval('public.proyectos_id_proyecto_seq'::regclass);


--
-- Name: recurso_tecnico id_recurso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recurso_tecnico ALTER COLUMN id_recurso SET DEFAULT nextval('public.recurso_tecnico_id_recurso_seq'::regclass);


--
-- Name: roles_personal id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_personal ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_personal_id_rol_seq'::regclass);


--
-- Name: tipos_proyecto id_tipo_proyecto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_proyecto ALTER COLUMN id_tipo_proyecto SET DEFAULT nextval('public.tipos_proyecto_id_tipo_proyecto_seq'::regclass);


--
-- Name: tipos_recurso id_tipo_recurso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_recurso ALTER COLUMN id_tipo_recurso SET DEFAULT nextval('public.tipos_recurso_id_tipo_recurso_seq'::regclass);


--
-- Name: uso_recurso id_uso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uso_recurso ALTER COLUMN id_uso SET DEFAULT nextval('public.uso_recurso_id_uso_seq'::regclass);


--
-- Data for Name: asignacion_personal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asignacion_personal (id_asignacion, id_proyecto, id_personal, horas_trabajadas, fecha_registro) FROM stdin;



--
-- Data for Name: categorias_gasto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias_gasto (id_categoria_gasto, nombre_categoria) FROM stdin;
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id_cliente, rif_cliente, nombre_cliente, email_cliente, telefono_cliente) FROM stdin;
\.


--
-- Data for Name: contratos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contratos (id_contrato, id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios) FROM stdin;
\.


--
-- Data for Name: entregables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entregables (id_entregable, id_proyecto, descripcion, fecha_entrega_estimada, id_estado_entregable, link_entrega) FROM stdin;
\.


--
-- Data for Name: estados_entregable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estados_entregable (id_estado_entregable, nombre_estado) FROM stdin;
\.


--
-- Data for Name: estados_pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estados_pago (id_estado_pago, nombre_estado) FROM stdin;
\.


--
-- Data for Name: estados_proyecto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estados_proyecto (id_estado_proyecto, nombre_estado) FROM stdin;
\.


--
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facturas (id_factura, id_contrato, fecha_emision, monto_total, id_estado_pago) FROM stdin;
\.


--
-- Data for Name: gastos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gastos (id_gasto, descripcion_gasto, id_categoria_gasto, monto_gasto, fecha_gasto, id_contrato) FROM stdin;
\.


--
-- Data for Name: gestor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gestor (id_gestor, nombre_gestor, usuario_gestor, pass_gestor) FROM stdin;
\.


--
-- Data for Name: locaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locaciones (id_locacion, nombre_locacion, direccion, descripcion_locacion) FROM stdin;
\.


--
-- Data for Name: pagos_personal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagos_personal (id_pago, id_personal, id_asignacion, monto_pagado, fecha_pago, motivo_pago) FROM stdin;
\.


--
-- Data for Name: personal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal (id_personal, nombre_personal, cedula_personal, id_rol, salario, email_personal, telefono) FROM stdin;
\.


--
-- Data for Name: proyecto_locaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proyecto_locaciones (id_proyecto, id_locacion) FROM stdin;
\.


--
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proyectos (id_proyecto, nombre_proyecto, id_tipo_proyecto, id_estado_proyecto, fecha_inicio, fecha_fin_estimada, presupuesto) FROM stdin;
\.


--
-- Data for Name: recurso_tecnico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recurso_tecnico (id_recurso, nombre_equipo, id_tipo_recurso) FROM stdin;
\.


--
-- Data for Name: roles_personal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles_personal (id_rol, nombre_rol) FROM stdin;
\.


--
-- Data for Name: tipos_proyecto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_proyecto (id_tipo_proyecto, nombre_tipo) FROM stdin;
\.


--
-- Data for Name: tipos_recurso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_recurso (id_tipo_recurso, nombre_tipo) FROM stdin;
\.


--
-- Data for Name: uso_recurso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.uso_recurso (id_uso, id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso) FROM stdin;
\.


--
-- Name: asignacion_personal_id_asignacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asignacion_personal_id_asignacion_seq', 1, false);


--
-- Name: categorias_gasto_id_categoria_gasto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_gasto_id_categoria_gasto_seq', 1, false);


--
-- Name: clientes_id_cliente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_id_cliente_seq', 1, false);


--
-- Name: contratos_id_contrato_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contratos_id_contrato_seq', 1, false);


--
-- Name: entregables_id_entregable_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entregables_id_entregable_seq', 1, false);


--
-- Name: estados_entregable_id_estado_entregable_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estados_entregable_id_estado_entregable_seq', 1, false);


--
-- Name: estados_pago_id_estado_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estados_pago_id_estado_pago_seq', 1, false);


--
-- Name: estados_proyecto_id_estado_proyecto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estados_proyecto_id_estado_proyecto_seq', 1, false);


--
-- Name: facturas_id_factura_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facturas_id_factura_seq', 1, false);


--
-- Name: gastos_id_gasto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gastos_id_gasto_seq', 1, false);


--
-- Name: gestor_id_gestor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gestor_id_gestor_seq', 1, false);


--
-- Name: locaciones_id_locacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.locaciones_id_locacion_seq', 1, false);


--
-- Name: pagos_personal_id_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagos_personal_id_pago_seq', 1, false);


--
-- Name: personal_id_personal_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_id_personal_seq', 1, false);


--
-- Name: proyectos_id_proyecto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proyectos_id_proyecto_seq', 1, false);


--
-- Name: recurso_tecnico_id_recurso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recurso_tecnico_id_recurso_seq', 1, false);


--
-- Name: roles_personal_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_personal_id_rol_seq', 1, false);


--
-- Name: tipos_proyecto_id_tipo_proyecto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_proyecto_id_tipo_proyecto_seq', 1, false);


--
-- Name: tipos_recurso_id_tipo_recurso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_recurso_id_tipo_recurso_seq', 1, false);


--
-- Name: uso_recurso_id_uso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.uso_recurso_id_uso_seq', 1, false);


--
-- Name: asignacion_personal asignacion_personal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_personal
    ADD CONSTRAINT asignacion_personal_pkey PRIMARY KEY (id_asignacion);


--
-- Name: categorias_gasto categorias_gasto_nombre_categoria_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_gasto
    ADD CONSTRAINT categorias_gasto_nombre_categoria_key UNIQUE (nombre_categoria);


--
-- Name: categorias_gasto categorias_gasto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_gasto
    ADD CONSTRAINT categorias_gasto_pkey PRIMARY KEY (id_categoria_gasto);


--
-- Name: clientes clientes_email_cliente_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_email_cliente_key UNIQUE (email_cliente);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente);


--
-- Name: clientes clientes_rif_cliente_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_rif_cliente_key UNIQUE (rif_cliente);


--
-- Name: contratos contratos_id_proyecto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_id_proyecto_key UNIQUE (id_proyecto);


--
-- Name: contratos contratos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_pkey PRIMARY KEY (id_contrato);


--
-- Name: entregables entregables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entregables
    ADD CONSTRAINT entregables_pkey PRIMARY KEY (id_entregable);


--
-- Name: estados_entregable estados_entregable_nombre_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_entregable
    ADD CONSTRAINT estados_entregable_nombre_estado_key UNIQUE (nombre_estado);


--
-- Name: estados_entregable estados_entregable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_entregable
    ADD CONSTRAINT estados_entregable_pkey PRIMARY KEY (id_estado_entregable);


--
-- Name: estados_pago estados_pago_nombre_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_pago
    ADD CONSTRAINT estados_pago_nombre_estado_key UNIQUE (nombre_estado);


--
-- Name: estados_pago estados_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_pago
    ADD CONSTRAINT estados_pago_pkey PRIMARY KEY (id_estado_pago);


--
-- Name: estados_proyecto estados_proyecto_nombre_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_proyecto
    ADD CONSTRAINT estados_proyecto_nombre_estado_key UNIQUE (nombre_estado);


--
-- Name: estados_proyecto estados_proyecto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_proyecto
    ADD CONSTRAINT estados_proyecto_pkey PRIMARY KEY (id_estado_proyecto);


--
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (id_factura);


--
-- Name: gastos gastos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT gastos_pkey PRIMARY KEY (id_gasto);


--
-- Name: gestor gestor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestor
    ADD CONSTRAINT gestor_pkey PRIMARY KEY (id_gestor);


--
-- Name: gestor gestor_usuario_gestor_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestor
    ADD CONSTRAINT gestor_usuario_gestor_key UNIQUE (usuario_gestor);


--
-- Name: locaciones locaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locaciones
    ADD CONSTRAINT locaciones_pkey PRIMARY KEY (id_locacion);


--
-- Name: pagos_personal pagos_personal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_personal
    ADD CONSTRAINT pagos_personal_pkey PRIMARY KEY (id_pago);


--
-- Name: personal personal_cedula_personal_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal
    ADD CONSTRAINT personal_cedula_personal_key UNIQUE (cedula_personal);


--
-- Name: personal personal_email_personal_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal
    ADD CONSTRAINT personal_email_personal_key UNIQUE (email_personal);


--
-- Name: personal personal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal
    ADD CONSTRAINT personal_pkey PRIMARY KEY (id_personal);


--
-- Name: proyecto_locaciones proyecto_locaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_locaciones
    ADD CONSTRAINT proyecto_locaciones_pkey PRIMARY KEY (id_proyecto, id_locacion);


--
-- Name: proyectos proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id_proyecto);


--
-- Name: recurso_tecnico recurso_tecnico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recurso_tecnico
    ADD CONSTRAINT recurso_tecnico_pkey PRIMARY KEY (id_recurso);


--
-- Name: roles_personal roles_personal_nombre_rol_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_personal
    ADD CONSTRAINT roles_personal_nombre_rol_key UNIQUE (nombre_rol);


--
-- Name: roles_personal roles_personal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_personal
    ADD CONSTRAINT roles_personal_pkey PRIMARY KEY (id_rol);


--
-- Name: tipos_proyecto tipos_proyecto_nombre_tipo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_proyecto
    ADD CONSTRAINT tipos_proyecto_nombre_tipo_key UNIQUE (nombre_tipo);


--
-- Name: tipos_proyecto tipos_proyecto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_proyecto
    ADD CONSTRAINT tipos_proyecto_pkey PRIMARY KEY (id_tipo_proyecto);


--
-- Name: tipos_recurso tipos_recurso_nombre_tipo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_recurso
    ADD CONSTRAINT tipos_recurso_nombre_tipo_key UNIQUE (nombre_tipo);


--
-- Name: tipos_recurso tipos_recurso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_recurso
    ADD CONSTRAINT tipos_recurso_pkey PRIMARY KEY (id_tipo_recurso);


--
-- Name: uso_recurso uso_recurso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uso_recurso
    ADD CONSTRAINT uso_recurso_pkey PRIMARY KEY (id_uso);


--
-- Name: asignacion_personal asignacion_personal_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_personal
    ADD CONSTRAINT asignacion_personal_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal(id_personal) ON DELETE CASCADE;


--
-- Name: asignacion_personal asignacion_personal_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_personal
    ADD CONSTRAINT asignacion_personal_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto) ON DELETE CASCADE;


--
-- Name: contratos contratos_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente) ON DELETE SET NULL;


--
-- Name: contratos contratos_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto) ON DELETE CASCADE;


--
-- Name: entregables entregables_id_estado_entregable_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entregables
    ADD CONSTRAINT entregables_id_estado_entregable_fkey FOREIGN KEY (id_estado_entregable) REFERENCES public.estados_entregable(id_estado_entregable);


--
-- Name: entregables entregables_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entregables
    ADD CONSTRAINT entregables_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto) ON DELETE CASCADE;


--
-- Name: facturas facturas_id_contrato_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_id_contrato_fkey FOREIGN KEY (id_contrato) REFERENCES public.contratos(id_contrato) ON DELETE CASCADE;


--
-- Name: facturas facturas_id_estado_pago_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_id_estado_pago_fkey FOREIGN KEY (id_estado_pago) REFERENCES public.estados_pago(id_estado_pago);


--
-- Name: gastos fk_gastos_contratos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT fk_gastos_contratos FOREIGN KEY (id_contrato) REFERENCES public.contratos(id_contrato);


--
-- Name: gastos gastos_id_categoria_gasto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT gastos_id_categoria_gasto_fkey FOREIGN KEY (id_categoria_gasto) REFERENCES public.categorias_gasto(id_categoria_gasto);


--
-- Name: pagos_personal pagos_personal_id_asignacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_personal
    ADD CONSTRAINT pagos_personal_id_asignacion_fkey FOREIGN KEY (id_asignacion) REFERENCES public.asignacion_personal(id_asignacion);


--
-- Name: pagos_personal pagos_personal_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_personal
    ADD CONSTRAINT pagos_personal_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal(id_personal);


--
-- Name: personal personal_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal
    ADD CONSTRAINT personal_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles_personal(id_rol);


--
-- Name: proyecto_locaciones proyecto_locaciones_id_locacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_locaciones
    ADD CONSTRAINT proyecto_locaciones_id_locacion_fkey FOREIGN KEY (id_locacion) REFERENCES public.locaciones(id_locacion) ON DELETE CASCADE;


--
-- Name: proyecto_locaciones proyecto_locaciones_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_locaciones
    ADD CONSTRAINT proyecto_locaciones_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto) ON DELETE CASCADE;


--
-- Name: proyectos proyectos_id_estado_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_id_estado_proyecto_fkey FOREIGN KEY (id_estado_proyecto) REFERENCES public.estados_proyecto(id_estado_proyecto);


--
-- Name: proyectos proyectos_id_tipo_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_id_tipo_proyecto_fkey FOREIGN KEY (id_tipo_proyecto) REFERENCES public.tipos_proyecto(id_tipo_proyecto);


--
-- Name: recurso_tecnico recurso_tecnico_id_tipo_recurso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recurso_tecnico
    ADD CONSTRAINT recurso_tecnico_id_tipo_recurso_fkey FOREIGN KEY (id_tipo_recurso) REFERENCES public.tipos_recurso(id_tipo_recurso);


--
-- Name: uso_recurso uso_recurso_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uso_recurso
    ADD CONSTRAINT uso_recurso_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto) ON DELETE CASCADE;


--
-- Name: uso_recurso uso_recurso_id_recurso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uso_recurso
    ADD CONSTRAINT uso_recurso_id_recurso_fkey FOREIGN KEY (id_recurso) REFERENCES public.recurso_tecnico(id_recurso) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

-- \unrestrict g9Z0nksASjVlIQWr3igRxKh1lANh2rkGUyx1eYEKYOgQlhzBhatTuqM0fhX0ERd

