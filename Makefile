# Blog «Corriente» — material didáctico del curso Lidr AI4Devs.
# API en 3401, web en 5401. No se usan 3333 ni 5173 a propósito.

PUERTO_API ?= 3401
PUERTO_WEB ?= 5401

.DEFAULT_GOAL := ayuda

.PHONY: ayuda setup db api web test test-coverage fuga build limpiar

ayuda:
	@echo ""
	@echo "  make setup          instala dependencias y prepara backend/.env"
	@echo "  make db             recrea la base SQLite y la vuelve a sembrar"
	@echo "  make api            arranca la API en http://localhost:$(PUERTO_API)"
	@echo "  make web            arranca la web en http://localhost:$(PUERTO_WEB)"
	@echo "  make test           corre la suite (la que hay: un test)"
	@echo "  make test-coverage  corre la suite y mide cobertura con c8"
	@echo "  make fuga           enseña los correos que salen en la respuesta pública"
	@echo "  make build          compila el frontend"
	@echo "  make limpiar        borra la base de datos y la cobertura"
	@echo ""

setup:
	npm install --prefix backend
	npm install --prefix frontend
	@test -f backend/.env || (cp backend/.env.example backend/.env && cd backend && node ace generate:key)
	@echo "Listo. Ahora: make db"

db:
	cd backend && node ace migration:fresh && node ace db:seed

api:
	cd backend && node ace serve

web:
	cd frontend && npm run dev

test:
	npm test --prefix backend

test-coverage:
	npm run test:coverage --prefix backend

# Enseña el dato personal saliendo por la respuesta pública. Falla RUIDOSAMENTE si la
# API no está levantada o la base no está sembrada: `curl -s | grep` se calla en los dos
# casos, y un vacío silencioso en mitad de una demo es indistinguible de "no hay fuga".
fuga:
	@curl -s --max-time 3 -o /dev/null localhost:$(PUERTO_API)/ 2>/dev/null || { \
	  echo "⛔ Nada escuchando en el $(PUERTO_API). Levanta la API en otra terminal: make api"; exit 1; }
	@curl -s localhost:$(PUERTO_API)/posts/diez-tendencias-de-diseno-que-pueden-cambiar-la-web-moderna \
	  | grep -o '"autor_email":"[^"]*"' \
	  || { echo "⚠️  La API responde pero no sale ningún correo. ¿Has sembrado la base? make db"; exit 1; }

build:
	npm run build --prefix frontend

limpiar:
	rm -f backend/tmp/db.sqlite3
	rm -rf backend/coverage frontend/dist
