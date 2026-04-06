import opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const exporterOptions = {
  url: 'http://localhost:4318/v1/traces'
};

const traceExporter = new OTLPTraceExporter(exporterOptions);

const sdk = new opentelemetry.NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  resource: resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'be-car-insurance',
  }),
});

sdk.start();
