/*
subscription example: {
    "status": "ACTIVE",
    "status_update_time": "2025-07-25T09:03:13Z",
    "status_changed_by": "MERCHANT",
    "id": "I-BA3T507CPXK8",
    "plan_id": "P-7AJ09605LT627470LNCBOEVQ",
    "start_time": "2025-07-25T09:02:27Z",
    "quantity": "1",
    "shipping_amount": {
        "currency_code": "USD",
        "value": "0.0"
    },
    "subscriber": {
        "email_address": "sb-ree6p36958668@personal.example.com",
        "payer_id": "GYDYPD4J6NW2N",
        "name": {
            "given_name": "Benjamin",
            "surname": "Gray"
        },
        "tenant": "PAYPAL",
        "shipping_address": {
            "address": {
                "address_line_1": "1 Main St",
                "admin_area_2": "San Jose",
                "admin_area_1": "CA",
                "postal_code": "95131",
                "country_code": "US"
            }
        }
    },
    "billing_info": {
        "outstanding_balance": {
            "currency_code": "USD",
            "value": "0.0"
        },
        "cycle_executions": [
            {
                "tenure_type": "REGULAR",
                "sequence": 1,
                "cycles_completed": 1,
                "cycles_remaining": 0,
                "current_pricing_scheme_version": 1,
                "total_price_per_cycle": {
                    "gross_amount": {
                        "currency_code": "USD",
                        "value": "199.0"
                    },
                    "total_item_amount": {
                        "currency_code": "USD",
                        "value": "199.0"
                    },
                    "shipping_amount": {
                        "currency_code": "USD",
                        "value": "0.0"
                    },
                    "tax_amount": {
                        "currency_code": "USD",
                        "value": "0.0"
                    }
                },
                "total_cycles": 0
            }
        ],
        "last_payment": {
            "amount": {
                "currency_code": "USD",
                "value": "199.0"
            },
            "time": "2025-07-25T09:03:12Z"
        },
        "next_billing_time": "2025-08-25T10:00:00Z",
        "failed_payments_count": 0
    },
    "create_time": "2025-07-25T09:03:12Z",
    "update_time": "2025-07-25T09:03:13Z",
    "plan_overridden": false,
    "links": [
        {
            "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-BA3T507CPXK8/cancel",
            "rel": "cancel",
            "method": "POST"
        },
        {
            "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-BA3T507CPXK8",
            "rel": "edit",
            "method": "PATCH"
        },
        {
            "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-BA3T507CPXK8",
            "rel": "self",
            "method": "GET"
        },
        {
            "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-BA3T507CPXK8/suspend",
            "rel": "suspend",
            "method": "POST"
        },
        {
            "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-BA3T507CPXK8/capture",
            "rel": "capture",
            "method": "POST"
        }
    ]
}

*/

export interface Subscription {
  status: string;
  status_update_time: string;
  status_changed_by: string;
  id: string;
  plan_id: string;
  start_time: string;
  quantity: string;
  shipping_amount: {
    currency_code: string;
    value: string;
  };
  subscriber: {
    email_address: string;
    payer_id: string;
  };
  billing_info: {
    outstanding_balance: {
      currency_code: string;
      value: string;
    };
    cycle_executions: {
      tenure_type: string;
      sequence: number;
      cycles_completed: number;
      cycles_remaining: number;
      current_pricing_scheme_version: number;
      total_price_per_cycle: {
        gross_amount: {
          currency_code: string;
          value: string;
        };
        total_item_amount: {
          currency_code: string;
          value: string;
        };
        shipping_amount: {
          currency_code: string;
          value: string;
        };
        tax_amount: {
          currency_code: string;
          value: string;
        };
      };
      total_cycles: number;
    }[];
    last_payment: {
      amount: {
        currency_code: string;
        value: string;
      };
      time: string;
    };
    next_billing_time: string;
    failed_payments_count: number;
  };
  create_time: string;
  update_time: string;
  plan_overridden: boolean;
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
}
