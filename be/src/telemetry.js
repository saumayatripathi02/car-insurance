import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

let sdk = null

try {
  const exporterOptions = {
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
  }

  const traceExporter = new OTLPTraceExporter(exporterOptions)

  sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    resource: resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: 'be-car-insurance',
    }),
  })

  sdk.start()
  console.log('✓ OpenTelemetry tracing initialized')
} catch (error) {
  console.warn('⚠️  OpenTelemetry initialization failed:', error.message)
  console.warn('App will continue without tracing')
  sdk = null
}

// Graceful shutdown for SDK if it initialized
if (sdk) {
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('✓ OpenTelemetry SDK shut down'))
      .catch((err) => console.error('Error shutting down OpenTelemetry:', err))
      .finally(() => process.exit(0))
  })
}

export default sdk
